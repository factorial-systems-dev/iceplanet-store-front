// whatsapp-button.component.ts
import { Component, Input } from '@angular/core';
import {MatTooltip} from "@angular/material/tooltip";
import {ChatConnectionStatus} from "../../shared/model/chat-session.model";

@Component({
    selector: 'app-whatsapp-button',
    template: `
        <a [href]="whatsappLink"
           [matTooltip]="'Chat with us'"
           class="whatsapp-float"
           target="_blank"
           rel="noopener">
            <i class="ri-whatsapp-line"></i>
        </a>
    `,
    standalone: true,
    imports: [
        MatTooltip
    ],
    styles: [`
        .whatsapp-float {
            position: fixed;
            width: 60px;
            height: 60px;
            bottom: 40px;
            right: 40px;
            background-color: #25d366;
            color: #FFF;
            border-radius: 50px;
            text-align: center;
            font-size: 30px;
            box-shadow: 2px 2px 3px #999;
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            transition: all 0.3s ease;
        }

        .whatsapp-float:hover {
            background-color: #128C7E;
            transform: scale(1.1);
        }

        @media screen and (max-width: 767px) {
            .whatsapp-float {
                width: 50px;
                height: 50px;
                bottom: 20px;
                right: 20px;
                font-size: 25px;
            }
        }
    `]
})
export class WhatsAppButtonComponent {
    @Input() phoneNumber: string = ''; // Add your WhatsApp number here
    @Input() message: string = 'Hello! I would like to inquire about...';

    get whatsappLink(): string {
        const encodedMessage = encodeURIComponent(this.message);
        return `https://wa.me/${this.phoneNumber}?text=${encodedMessage}`;
    }

    protected readonly ChatConnectionStatus = ChatConnectionStatus;
}
