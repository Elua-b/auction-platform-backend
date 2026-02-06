import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { PrismaService } from '../infra/config/prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }

    async sendEmail(to: string, subject: string, text: string, html?: string) {
        if (!process.env.SENDGRID_API_KEY) {
            console.log('SendGrid API key not set, skipping email');
            return;
        }
        const msg = {
            to,
            from: process.env.SENDGRID_FROM_EMAIL || 'bugingoelua@gmail.com',
            subject,
            text,
            html: html || text,
        };

        try {
            await sgMail.send(msg);
            console.log(`Email sent to ${to}`);
        } catch (error) {
            console.error('Error sending email:', error);
            if (error.response) {
                console.error(error.response.body);
            }
        }
    }

    async createNotification(data: { userId: string; type: string; message: string; relatedAuctionId?: string }) {
        return this.prisma.notification.create({
            data,
        });
    }

    async findAll(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findUnreadCount(userId: string) {
        return this.prisma.notification.count({
            where: { userId, read: false },
        });
    }

    async markAsRead(id: string, userId: string) {
        return this.prisma.notification.updateMany({
            where: { id, userId },
            data: { read: true },
        });
    }

    async remove(id: string, userId: string) {
        return this.prisma.notification.deleteMany({
            where: { id, userId },
        });
    }

    async notifyAuctionWin(userId: string, userEmail: string, productName: string, amount: number, auctionId: string) {
        const subject = `Congratulations! You won the auction for ${productName}`;
        const message = `You have successfully won the auction for ${productName} with a bid of RWF ${amount.toLocaleString()}. Please complete your payment to proceed.`;

        // In-app
        await this.createNotification({
            userId,
            type: 'AUCTION_WON',
            message,
            relatedAuctionId: auctionId,
        });

        // Email
        await this.sendEmail(userEmail, subject, message);
    }

    async notifyOutbid(userId: string, userEmail: string, productName: string, newPrice: number, auctionId: string) {
        const subject = `You've been outbid on ${productName}`;
        const message = `Someone has placed a higher bid on ${productName}. The current price is now RWF ${newPrice.toLocaleString()}. Place a new bid to stay in the game!`;

        // In-app
        await this.createNotification({
            userId,
            type: 'BID_OUTBID',
            message,
            relatedAuctionId: auctionId,
        });

        // Email
        await this.sendEmail(userEmail, subject, message);
    }
}
