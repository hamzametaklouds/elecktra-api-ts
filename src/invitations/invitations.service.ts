import { Injectable, Inject, BadRequestException, forwardRef } from '@nestjs/common';
import { Model, ObjectId, ObjectIdSchemaDefinition } from 'mongoose';
import { IPageinatedDataTable } from 'src/app/interfaces';
import { IInvitations, InvitationStatus } from './invitations.schema';
import { INVITATIONS_PROVIDER_TOKEN } from './invitations.constants';
import { CreateInvitationDto } from './dtos/create-invitations.dto';
import * as SendGrid from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
const postmark = require("postmark");
import * as jwt from 'jsonwebtoken';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/roles/roles.schema';
import { UpdateInvitationDto } from './dtos/update-invitation.dto';

@Injectable()
export class InvitationsService {

  constructor(
    @Inject(INVITATIONS_PROVIDER_TOKEN)
    private invitationModel: Model<IInvitations>,
    private configService: ConfigService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService
  ) {
    SendGrid.setApiKey(this.configService.get('sendGridEmail.sendGridApiKey'));
  }

  /**
   * Retrieves an invitation by its ID
   * @param id The invitation ID
   * @returns Promise containing the invitation if found
   */
  async getinvitationById(id): Promise<IInvitations> {
    return await this.invitationModel
      .findOne({ _id: id, is_deleted: false });
  }


  /**
   * Retrieves an invitation by its link ID, excluding accepted invitations
   * @param id The link ID
   * @returns Promise containing the invitation if found
   */
  async getinvitationByLinkId(id): Promise<IInvitations> {
    return await this.invitationModel
      .findOne({ link_id: id, invitation_status: { $ne: InvitationStatus.A }, is_deleted: false });
  }



  /**
   * Validates an invitation link token and updates invitation status to Opened
   * @param token JWT token containing the link_id
   * @returns Promise containing the updated invitation
   * @throws BadRequestException if token is invalid or invitation expired
   */
  async validateInvitationLink(token: string) {
    try {
      // Decode the token to get the `link_id`
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { link_id: string };

      console.log(decoded)
      const { link_id } = decoded;
      console.log(link_id)

      console.log('link id----', link_id)

      // Find the invitation by `link_id` with additional conditions
      const invitation = await this.invitationModel.findOne({
        link_id: link_id,
        is_deleted: false,
        is_disabled: false,
        is_used: false,
        invitation_status: { $ne: InvitationStatus.A }
      });

      if (!invitation) {
        throw new BadRequestException('Invalid or expired invitation link');
      }


      // Check if the invitation is older than 2 days
      // const twoDaysInMillis = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
      // const currentTime = new Date().getTime();
      // const createdTime = new Date(invitation.created_at).getTime();

      // if (currentTime - createdTime > twoDaysInMillis) {
      //   throw new BadRequestException('Invitation has expired');

      // }

      const updatedInvitation = await this.invitationModel.findByIdAndUpdate({ _id: invitation._id }, { invitation_status: InvitationStatus.O }, { new: true })

      return updatedInvitation;
    } catch (error) {
      throw new BadRequestException('Invalid or expired invitation link');
    }
  }



  /**
   * Sends an email using Postmark service
   * @param to Recipient email address
   * @param subject Email subject
   * @param message HTML email content
   */
  async sendEmail(to: string, subject: string, message: string) {
    try {
      const client = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN);
      const result = await client.sendEmail({
        From: "hamza@metaklouds.com", // Verified sender email
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

  /**
   * Retrieves an invitation by band ID
   * @param id The band ID
   * @returns Promise containing the invitation if found
   */
  async getinvitationByBandId(id: string): Promise<IInvitations> {
    return await this.invitationModel
      .findOne({ band_id: id, is_deleted: false });
  }

  /**
   * Marks an invitation as deleted
   * @param id The invitation ID
   * @returns Promise containing the updated invitation
   */
  async deleteInvitation(id): Promise<IInvitations> {
    return await this.invitationModel
      .findByIdAndUpdate({ _id: id }, { is_deleted: true });
  }

  /**
   * Retrieves an invitation by section ID for section staff
   * @param id The section ID
   * @returns Promise containing the invitation if found
   */
  async getinvitationBySectionId(id: string): Promise<IInvitations> {
    return await this.invitationModel
      .findOne({ section: id, is_for_section_staff: true });
  }

  /**
   * Retrieves an invitation by name
   * @param name The invitation name
   * @returns Promise containing the invitation if found
   */
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

    filter['role'] = {
      $in: [
        'SUPPORT_ADMIN',
        'BUSINESS_ADMIN',
        'BUSINESS_OWNER',
        'USER'
      ]
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
   
    return { pages: `Page ${page} of ${totalPages}`, total: totalDocuments, data: invitations };
  }

  /**
   *The purpose of this method is to return invitations based on filter
   * @param $filter filter query as an argument
   * @param $orderBy orderby as an argument
   * @returns invitations based on filter
   */
  async getFilteredInvitations($filter: Object, $orderBy, user) {

    console.log('user-----', user)

    if (user?.company_id) {
      $filter['company_id'] = user?.company_id
    }

    $filter['role'] = {
      $in: [
        'SUPPORT_ADMIN',
        'BUSINESS_ADMIN',
        'USER'
      ]
    }

    console.log('filter-----', $filter)


    return await this.invitationModel
      .find($filter, { created_at: 0, updated_at: 0, __v: 0, is_deleted: 0, is_disabled: 0, created_by: 0, updated_by: 0 })
      .sort($orderBy)
     
  }

  /**
  * The purpose of this method is to create and send invitation inside mongodb
  * @param datasetObject receives invitation object of interface type IInvitations as an argument
  * @returns the created invitation object
  */


  /**
   * Creates and sends a new invitation to a user
   * @param invitationObject DTO containing invitation details
   * @param user Current user making the request
   * @returns Promise containing the created invitation
   * @throws BadRequestException if email exists or company is invalid
   */
  async sendInvitation(invitationObject: CreateInvitationDto, user: { userId?: ObjectId, company_id?: ObjectId }) {
    const { email, role } = invitationObject;

    const userWithEmail = await this.usersService.getUserByEmail(email.toLowerCase())

    if (userWithEmail) {
      throw new BadRequestException('User with this email already exists')
    }

    // Delete any existing pending invitations for this email
  
    let companyExists;

    // Generate unique invitation link ID
    const generatedLinkId = uuidv4();

    // Generate a JWT token with the `link_id`
    const token = jwt.sign({ link_id: generatedLinkId }, process.env.JWT_SECRET, { expiresIn: '3d' });
    // const invitationLink = `https://voyage-vite-admi-panel.vercel.app/signup/${token}`;
    let invitationLink = `https://electra-seven-wine.vercel.app/signup?t=${token}`;

    // Save the invitation in the database
    const invitation = await new this.invitationModel({
      email: email.toLowerCase(),
      link_id: generatedLinkId,
      token:token,
      company_id: user?.company_id,
      role,
      invitation_status: InvitationStatus.P,
      created_by: user.userId ?? null,
    }).save();

    // Define a template for the invitation email
    const emailSubject = "You're Invited to Join Electra!";
    const emailMessage = `
      <html>
          <body>
              <h1>Welcome to Electra!</h1>
              <p>You have been invited to join our platform. Click the link below to accept your invitation:</p>
              <a href="${invitationLink}" style="color: blue; text-decoration: underline;">Accept Invitation</a>
              <p>Thank you,<br>Electra Team</p>
          </body>
      </html>
  `;

    // Send the invitation email
    await this.sendEmail(email, emailSubject, emailMessage);

    return {message: 'Invitation sent successfully'};
  }

  /**
   * Sends a forgot password email with reset link
   * @param email User's email address
   * @returns Promise containing success message
   */
  async sendForgotPasswordEmail(email: string) {
    // Check if the user exists
    const user = await this.usersService.getUserByEmail(email);
    console.log('user-----', user)
    if (!user) {
      return { message: 'Password reset email sent successfully' };
    }

    // Generate unique reset link ID
    const resetLinkId = uuidv4();

    // Generate a JWT token with the `reset_link_id`
    const token = jwt.sign({ link_id: resetLinkId }, process.env.JWT_SECRET, { expiresIn: '4d' });

    console.log('token-----', token)

    // Generate the reset password link

    const resetPasswordLink = `https://electra-seven-wine.vercel.app/reset-password/${token}`;

    const invitation = await new this.invitationModel({
      email,
      company_id: null,
      company_name: null,
      link_id: resetLinkId,
      role: user?.roles[0],
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
              <p>Thank you,<br>Electra Team</p>
          </body>
      </html>
  `;

    // Send the email
    const x = await this.sendEmail(email, emailSubject, emailMessage);

    console.log('x-----', x)

    return { message: 'Password reset email sent successfully' };
  }


  /**
   * Updates an invitation status to Accepted and marks it as used
   * @param invitationId The invitation ID
   * @returns Promise containing the updated invitation
   */
  async updateInvitationUser(invitationId) {
    return await this.invitationModel.findByIdAndUpdate({ _id: invitationId }, { invitation_status: InvitationStatus.A, is_used: true })
  }

  /**
   * Retrieves an active invitation by ID
   * @param invitationId The invitation ID
   * @returns Promise containing the invitation if found
   */
  async getInvitationById(invitationId: ObjectId) {
    return await this.invitationModel.findOne({ _id: invitationId, is_disabled: false, is_deleted: false, invitation_status: { $ne: InvitationStatus.A } });
  }

  /**
   * Sends an email verification link to a user
   * @param email User's email address
   * @returns Promise containing success message
   */
  async sendVerificationEmail(email: string) {
    // Generate unique verification link ID
    const verificationLinkId = uuidv4();

    // Generate a JWT token with the link_id
    const token = jwt.sign({ link_id: verificationLinkId }, process.env.JWT_SECRET, { expiresIn: '3d' });

    // Generate the verification link
    const verificationLink = 
             `https://electra-seven-wine.vercel.app/verify-email/${token}`;

    // Create a new invitation record for verification
    const invitation = await new this.invitationModel({
        email: email.toLowerCase(),
        link_id: verificationLinkId,
        token: token,
        invitation_status: InvitationStatus.P,
        role: Role.EMAIL_VERIFICATION,
        is_used: false,
        company_id: null,
        created_by: null,
    }).save();

    // Define email template
    const emailSubject = 'Verify Your Email Address';
    const emailMessage = `
        <html>
            <body>
                <h1>Welcome to electra!</h1>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email Address</a>
                <p>If you did not create an account with electra, please ignore this email.</p>
                <p>This link will expire in 3 days.</p>
                <p>Thank you,<br>electra Team</p>
            </body>
        </html>
    `;

    // Send the verification email
    await this.sendEmail(email, emailSubject, emailMessage);

    return { message: 'Verification email sent successfully' };
  }

  /**
   * Updates the disabled and deleted status of an invitation
   * @param id The invitation ID
   * @param body The update invitation DTO containing is_disabled and is_deleted status
   * @param user Current user making the request
   * @returns Promise containing the updated invitation
   */
  async updateInvitationStatus(id: string, body: UpdateInvitationDto, user: any): Promise<IInvitations> {
    const { is_disabled, is_deleted } = body;
    
    const updateData: any = {
      updated_by: user.userId
    };
    
    if (typeof is_disabled !== 'undefined') {
      updateData.is_disabled = is_disabled;
    }
    
    if (typeof is_deleted !== 'undefined') {
      updateData.is_deleted = is_deleted;
    }
    
    // If either flag is true, ensure is_deleted is true
    if (is_disabled || is_deleted) {
      updateData.is_deleted = true;
    }
    
    const updatedInvitation = await this.invitationModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedInvitation) {
      throw new BadRequestException('Invitation not found');
    }

    return updatedInvitation;
  }

}
