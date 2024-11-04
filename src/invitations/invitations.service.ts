import { Injectable, ConflictException, Inject, NotFoundException, BadRequestException, forwardRef } from '@nestjs/common';
import { Model, ObjectId, Types } from 'mongoose';
import { IPageinatedDataTable } from 'src/app/interfaces';
import getMessages from 'src/app/api-messages';
import { IInvitations, InvitationStatus } from './invitations.schema';
import { INVITATIONS_PROVIDER_TOKEN } from './invitations.constants';
import { CreateInvitationDto } from './dtos/create-invitations.dto';
import * as SendGrid from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';
import { ValidateInvitationDto } from './dtos/validate-invitation.dto';
import { v4 as uuidv4 } from 'uuid';
import { SystemUsersService } from 'src/system-users/system-users.service';
const postmark = require("postmark");



const { RESOURCE_NOT_FOUND } = getMessages('invitations(s)');

@Injectable()
export class InvitationsService {
  constructor(
    @Inject(INVITATIONS_PROVIDER_TOKEN)
    private invitationModel: Model<IInvitations>,
    private configService: ConfigService
  ) {
    SendGrid.setApiKey(this.configService.get('sendGridEmail.sendGridApiKey'));
  }

  async getinvitationById(id): Promise<IInvitations> {
    return await this.invitationModel
      .findOne({ _id: id, is_deleted: false });
  }

  async sendEmail(to, subject, message) {
    try {
      const client = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN);

      const result = await client.sendEmail({
        From: "armel@voyagevite.com",  // Replace with your verified sender email
        To: to,
        Subject: subject,
        HtmlBody: message,
        MessageStream: "outbound", // Use "outbound" for regular emails; "broadcast" for newsletters
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
  async getPaginatedInvitations(rpp: number, page: number, filter: object, orderBy): Promise<IPageinatedDataTable> {

    await this.sendEmail('raoarsalanlatif@gmail.com', 'Voyagevite Invitation', 'Invitation sent')

    // if (!filter['company_id']) {
    //   throw new BadRequestException('Company Id must be provided in the filters')
    // }

    const skip: number = (page - 1) * rpp;
    const totalDocuments: number = await this.invitationModel.countDocuments(filter);
    const totalPages: number = Math.ceil(totalDocuments / rpp);
    page = page > totalPages ? totalPages : page;

    const invitations = await this.invitationModel
      .find(filter)
      .sort(orderBy)
      .skip(skip)
      .limit(rpp)
      .populate('company_id')
      .populate({
        path: 'created_by ',
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
  async getFilteredInvitations($filter: Object, $orderBy) {

    // if (!$filter['company_id']) {
    //   throw new BadRequestException('Company Id must be provided in the filters')
    // }


    return await this.invitationModel
      .find($filter)
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
    let {
      email,
      company_id,
      role
    } = invitationObject

    const companyExists = await this.getinvitationById(company_id)

    if (!companyExists) {
      throw new BadRequestException('Invalid company id')
    }

    const generatedLinkId = uuidv4();


    const invitation = await new this.invitationModel(
      {
        email,
        company_id,
        link_id: generatedLinkId,
        role,
        invitation_status: InvitationStatus.P,
        created_by: user.userId ? user.userId : null
      }).save();



    return invitation;

  }

  // async validateInvitation(body: ValidateInvitationDto) {


  //   const validatedInvitation = await this.invitationModel.findOne({ link_id: body.link_id, band_id: body.band_id, is_disabled: false, is_deleted: false })

  //   if (!validatedInvitation) {
  //     throw new BadRequestException('The invitation with the following link id does not exist');
  //   }

  //   if (validatedInvitation) {
  //     var diff = (validatedInvitation.created_at.getTime() - new Date().getTime()) / 1000;
  //     diff /= 60;
  //     const difference = Math.abs(Math.round(diff));
  //     const daysInSeconds = 86400 * parseInt(this.configService.get('platformInvitationExpiryInDays.platformInvitationExpiryInDays'))

  //     if (difference > daysInSeconds) {
  //       throw new BadRequestException('The invitation has been expired,try requesting again!');
  //     }
  //   }
  //   this.invitationModel.findByIdAndUpdate({ _id: validatedInvitation._id }, { is_used: true, invitation_status: InvitationStatus.O })

  //   const user = await this.systemUsersService.getUserById(validatedInvitation.user);

  //   const { password, ...data } = user;

  //   return { status: true, statusCode: 200, message: 'link id validated successfully!', data: { invitation_id: validatedInvitation._id, sent_to: validatedInvitation.email, permissions: validatedInvitation.permissions, role: validatedInvitation.role, band_id: validatedInvitation.band_id ? validatedInvitation.band_id : null, section: validatedInvitation.section ? validatedInvitation.section : null, user: data } };

  // }

  async updateInvitationUser(invitationId: ObjectId, user_id: ObjectId) {
    return await this.invitationModel.findByIdAndUpdate({ _id: invitationId }, { invitation_status: InvitationStatus.A, is_used: true })
  }

  async getInvitationById(invitationId: ObjectId) {
    return await this.invitationModel.findOne({ _id: invitationId, is_disabled: false, is_deleted: false, invitation_status: { $ne: InvitationStatus.A } });
  }

}
