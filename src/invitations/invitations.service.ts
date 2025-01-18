import { Injectable, Inject, BadRequestException, forwardRef } from '@nestjs/common';
import { Model, ObjectId, ObjectIdSchemaDefinition } from 'mongoose';
import { IPageinatedDataTable } from 'src/app/interfaces';
import { IInvitations, InvitationStatus } from './invitations.schema';
import { INVITATIONS_PROVIDER_TOKEN } from './invitations.constants';
import { CreateInvitationDto } from './dtos/create-invitations.dto';
import * as SendGrid from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { CompaniesService } from 'src/companies/companies.service';
const postmark = require("postmark");
import * as jwt from 'jsonwebtoken';
import { SystemUsersService } from 'src/system-users/system-users.service';


@Injectable()
export class InvitationsService {

  constructor(
    @Inject(INVITATIONS_PROVIDER_TOKEN)
    private invitationModel: Model<IInvitations>,
    private configService: ConfigService,
    private companiesService: CompaniesService,
    @Inject(forwardRef(() => SystemUsersService))
    private systemUserService: SystemUsersService
  ) {
    SendGrid.setApiKey(this.configService.get('sendGridEmail.sendGridApiKey'));
  }

  async getinvitationById(id): Promise<IInvitations> {
    return await this.invitationModel
      .findOne({ _id: id, is_deleted: false });
  }


  async validateInvitationLink(token: string) {
    try {
      // Decode the token to get the `link_id`
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { link_id: string };
      const { link_id } = decoded;

      console.log('link id----', link_id)

      // Find the invitation by `link_id` with additional conditions
      const invitation = await this.invitationModel.findOne({
        link_id: link_id,
        is_deleted: false,
        is_used: false,
        invitation_status: { $ne: InvitationStatus.A }
      });

      if (!invitation) {
        throw new BadRequestException('Invalid or expired invitation link');
      }

      // Check if the invitation is older than 2 days
      const twoDaysInMillis = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
      const currentTime = new Date().getTime();
      const createdTime = new Date(invitation.created_at).getTime();

      if (currentTime - createdTime > twoDaysInMillis) {
        throw new BadRequestException('Invitation has expired');

      }

      const updatedInvitation = await this.invitationModel.findByIdAndUpdate({ _id: invitation._id }, { invitation_status: InvitationStatus.O }, { new: true })

      return updatedInvitation;
    } catch (error) {
      throw new BadRequestException('Invalid or expired invitation link');
    }
  }



  async sendEmail(to: string, subject: string, message: string) {
    try {
      const client = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN);
      const result = await client.sendEmail({
        From: "armel@voyagevite.com", // Verified sender email
        To: to,
        Subject: subject,
        HtmlBody: message,
        MessageStream: "outbound", // Use "outbound" for transactional emails
      });
      console.log("Email sent successfully:", result);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  async getinvitationByBandId(id: string): Promise<IInvitations> {
    return await this.invitationModel
      .findOne({ band_id: id, is_deleted: false });
  }

  async getinvitationBySectionId(id: string): Promise<IInvitations> {
    return await this.invitationModel
      .findOne({ section: id, is_for_section_staff: true });
  }

  async getinvitationByName(name: string): Promise<IInvitations> {
    return await this.invitationModel
      .findOne({ invitation_name: name, is_deleted: false });
  }
  /**
   * The purpose of this method is to return paginated invitations based on received arguments
   * @param rpp recieves record per page as an argument
   * @param page receives page number as an argument
   * @param filter receives filter object as an argument
   * @param orderBy receives order by as an argument
   * @returns Page out of total pages, total number of documents received and filtered paginated invitation data
   */
  async getPaginatedInvitations(rpp: number, page: number, filter: object, orderBy, user): Promise<IPageinatedDataTable> {

    if (user?.company_id) {
      filter['company_id'] = user?.company_id
    }

    const skip: number = (page - 1) * rpp;
    const totalDocuments: number = await this.invitationModel.countDocuments(filter);
    const totalPages: number = Math.ceil(totalDocuments / rpp);
    page = page > totalPages ? totalPages : page;

    const invitations = await this.invitationModel
      .find(filter, { created_at: 0, updated_at: 0, __v: 0, is_deleted: 0, is_disabled: 0, created_by: 0, updated_by: 0 })
      .sort(orderBy)
      .skip(skip)
      .limit(rpp)
      .populate('company_id')
      .populate({
        path: 'created_by',
        select: '_id first_name last_name email phone_no',
        match: { is_deleted: false },
      });
    return { pages: `Page ${page} of ${totalPages}`, total: totalDocuments, data: invitations };
  }

  /**
   *The purpose of this method is to return invitations based on filter
   * @param $filter filter query as an argument
   * @param $orderBy orderby as an argument
   * @returns invitations based on filter
   */
  async getFilteredInvitations($filter: Object, $orderBy, user) {


    if (user?.company_id) {
      $filter['company_id'] = user?.company_id
    }

    return await this.invitationModel
      .find($filter, { created_at: 0, updated_at: 0, __v: 0, is_deleted: 0, is_disabled: 0, created_by: 0, updated_by: 0 })
      .sort($orderBy)
      .populate('company_id')
      .populate({
        path: 'created_by',
        select: '_id first_name last_name email phone_no',
        match: { is_deleted: false },
      });
  }

  /**
  * The purpose of this method is to create and send invitation inside mongodb
  * @param datasetObject receives invitation object of interface type IInvitations as an argument
  * @returns the created invitation object
  */


  async sendInvitation(invitationObject: CreateInvitationDto, user: { userId?: ObjectId }) {
    const { email, company_id, role } = invitationObject;

    const userWithEmail = await this.systemUserService.getUserByEmail(email)

    if (userWithEmail) {
      throw new BadRequestException('User with this email already exists')
    }

    let companyExists;
    if (company_id) {
      companyExists = await this.companiesService.getCompanyById(company_id);
      if (!companyExists) {
        throw new BadRequestException('Invalid company id');
      }
    }

    // Generate unique invitation link ID
    const generatedLinkId = uuidv4();

    // Generate a JWT token with the `link_id`
    const token = jwt.sign({ link_id: generatedLinkId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    // const invitationLink = `https://voyage-vite-admi-panel.vercel.app/signup/${token}`;
    const invitationLink = `https://portal.voyagevite.com/signup/${token}`;

    // Save the invitation in the database
    const invitation = await new this.invitationModel({
      email,
      company_id: company_id ? company_id : null,
      company_name: company_id ? companyExists?.title : null,
      link_id: generatedLinkId,
      role,
      invitation_status: InvitationStatus.P,
      created_by: user.userId ?? null,
    }).save();

    // Define a template for the invitation email
    const emailSubject = "You're Invited to Join VoyageVite!";
    const emailMessage = `
      <html>
          <body>
              <h1>Welcome to VoyageVite!</h1>
              <p>You have been invited to join our platform. Click the link below to accept your invitation:</p>
              <a href="${invitationLink}" style="color: blue; text-decoration: underline;">Accept Invitation</a>
              <p>Thank you,<br>VoyageVite Team</p>
          </body>
      </html>
  `;

    // Send the invitation email
    await this.sendEmail(email, emailSubject, emailMessage);

    return invitation;
  }

  async sendForgotPasswordEmail(email: string) {
    // Check if the user exists
    const user = await this.systemUserService.getUserByEmail(email);
    console.log('user-----', user)
    if (!user) {
      return { message: 'Password reset email sent successfully' };
    }

    // Generate unique reset link ID
    const resetLinkId = uuidv4();

    // Generate a JWT token with the `reset_link_id`
    const token = jwt.sign({ reset_link_id: resetLinkId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Generate the reset password link
    const resetPasswordLink = `https://portal.voyagevite.com/reset-password/${token}`;

    const invitation = await new this.invitationModel({
      email,
      company_id: null,
      company_name: null,
      link_id: resetLinkId,
      role: null,
      invitation_status: InvitationStatus.P,
      is_forget_password: true,
      created_by: null,
    }).save();

    // Define a template for the forgot password email
    const emailSubject = 'Reset Your Password';
    const emailMessage = `
      <html>
          <body>
              <h1>Password Reset Request</h1>
              <p>We received a request to reset your password. Click the link below to reset it:</p>
              <a href="${resetPasswordLink}" style="color: blue; text-decoration: underline;">Reset Password</a>
              <p>If you did not request this, please ignore this email.</p>
              <p>Thank you,<br>VoyageVite Team</p>
          </body>
      </html>
  `;

    // Send the email
    const x = await this.sendEmail(email, emailSubject, emailMessage);

    console.log('x-----', x)

    return { message: 'Password reset email sent successfully' };
  }


  async updateInvitationUser(invitationId) {
    return await this.invitationModel.findByIdAndUpdate({ _id: invitationId }, { invitation_status: InvitationStatus.A, is_used: true })
  }

  async getInvitationById(invitationId: ObjectId) {
    return await this.invitationModel.findOne({ _id: invitationId, is_disabled: false, is_deleted: false, invitation_status: { $ne: InvitationStatus.A } });
  }

}
