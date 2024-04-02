import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { SubscriberDocument } from 'src/subscribers/schemas/subscriber.schemas';
import { Job, JobDocument } from 'src/jobs/schemas/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Subscriber } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private mailerService: MailerService,
    @InjectModel(Subscriber.name)
    private subcribersModel: SoftDeleteModel<SubscriberDocument>,
    @InjectModel(Job.name)
    private jobsModel: SoftDeleteModel<JobDocument>
  ) { }

  // @Cron(CronExpression.EVERY_30_SECONDS)
  // testCron() {
  //   console.log(">>>check cron to run: ");
  // }

  @Get()
  @Public()
  @ResponseMessage("Test email")
  @Cron("0 10 0 * * 0")
  async handleTestEmail() {
    // const job = [
    //   {
    //     name: "sdkjhfkds",
    //     company: "mavis",
    //     salary: "5000",
    //     skills: ["hsiudhf", "lsidhgoisd"]
    //   },

    //   {
    //     name: "sdkjpoth878",
    //     company: "mavis1",
    //     salary: "2000",
    //     skills: ["hsiudhf", "lsidhgoisd"]
    //   }
    // ]
    const subcriber = await this.subcribersModel.find({});
    for (const subs of subcriber) {
      const subSkill = subs.skills;
      const jobWithMatchingSkill = await this.jobsModel.find({ skills: { $in: subSkill } });
      if (jobWithMatchingSkill?.length) {
        const jobs = jobWithMatchingSkill.map(item => {
          return {
            name: item.name,
            company: item.company.name,
            salary: `${item.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + " đ",
            skills: item.skills
          }
        })
        await this.mailerService.sendMail({
          to: "nguyendung30021109@gmail.com",
          from: '"Support Team" <support@example.com>', // override default from
          subject: 'Welcome to Nice App! Confirm your Email',
          template: "new-job",
          context: {
            reciver: subs.name,
            job: jobs
          }

        });
      }
    }
  }
}
