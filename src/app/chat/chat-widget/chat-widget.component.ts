import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ChatService } from '../../shared/service/chat.service';
import { AuthService } from '../../authentication/auth.service';
import { ChatConnectionStatus } from '../../shared/model/chat-session.model';

@Component({
    selector: 'app-chat-widget',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatBadgeModule,
        MatTooltipModule,
        MatDialogModule
    ],
    template: `
        <button
            *ngIf="shouldShowChat"
            mat-fab
            class="chat-widget-button"
            [class.connected]="isConnected"
            [class.connecting]="isConnecting"
            [class.error]="hasError"
            [matTooltip]="getTooltipText()"
            (click)="openChat()"
            [disabled]="!canOpenChat">

            <!-- Connection Status Indicator -->
            <div class="connection-indicator"
                 [class.connected]="isConnected"
                 [class.connecting]="isConnecting"
                 [class.error]="hasError">
            </div>

            <!-- Main Icon -->
            <mat-icon class="chat-icon">
                {{ getChatIcon() }}
            </mat-icon>

            <!-- Unread Messages Badge -->
            <span *ngIf="unreadCount > 0"
                  class="unread-badge"
                  [matBadge]="unreadCount"
                  matBadgePosition="above after"
                  matBadgeColor="warn"
                  matBadgeSize="small">
            </span>
        </button>
    `,
    styles: [`
        .chat-widget-button {
            position: fixed !important;
            bottom: 80px !important;
            right: 20px !important;
            z-index: 1000 !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            width: 56px !important;
            height: 56px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: none !important;
            overflow: visible;
        }

        .chat-widget-button:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .chat-widget-button:active {
            transform: scale(0.95);
        }

        .chat-widget-button.connected {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        }

        .chat-widget-button.connecting {
            background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
            animation: pulse 2s infinite;
        }

        .chat-widget-button.error {
            background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
        }

        .chat-widget-button:disabled {
            background: #ccc;
            color: #666;
            cursor: not-allowed;
            transform: none;
        }

        .chat-widget-button:disabled:hover {
            transform: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .connection-indicator {
            position: absolute;
            top: 4px;
            right: 4px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #ccc;
            border: 2px solid white;
            transition: all 0.3s ease;
        }

        .connection-indicator.connected {
            background: #4CAF50;
        }

        .connection-indicator.connecting {
            background: #FF9800;
            animation: blink 1s infinite;
        }

        .connection-indicator.error {
            background: #f44336;
        }

        .chat-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
            transition: transform 0.3s ease;
        }

        .chat-widget-button:hover .chat-icon {
            transform: scale(1.1);
        }

        .unread-badge {
            position: absolute;
            top: -8px;
            right: -8px;
        }

        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.7);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(255, 152, 0, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(255, 152, 0, 0);
            }
        }

        @keyframes blink {
            0%, 50% {
                opacity: 1;
            }
            51%, 100% {
                opacity: 0.3;
            }
        }

        @media screen and (max-width: 768px) {
            .chat-widget-button {
                bottom: 60px;
                right: 16px;
                width: 48px;
                height: 48px;
            }

            .chat-icon {
                font-size: 20px;
                width: 20px;
                height: 20px;
            }
        }
    `]
})
export class ChatWidgetComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    isAuthenticated = false;
    connectionStatus = ChatConnectionStatus.DISCONNECTED;
    unreadCount = 0;
    shouldShowChat = true;

    constructor(
        private chatService: ChatService,
        private authService: AuthService,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        console.log('Chat widget initializing...');

        // Monitor authentication status
        this.authService.user$
            .pipe(takeUntil(this.destroy$))
            .subscribe(user => {
                console.log('Chat widget - Auth status changed:', !!user, user);
                this.isAuthenticated = !!user;
                if (this.isAuthenticated && !this.chatService.isConnected()) {
                    console.log('Chat widget - Connecting to chat service...');
                    this.chatService.connect();
                }
            });

        // Monitor connection status
        this.chatService.connectionStatus$
            .pipe(takeUntil(this.destroy$))
            .subscribe(status => {
                console.log('Chat widget - Connection status changed:', status);
                this.connectionStatus = status;
            });

        // Monitor messages for unread count (simple implementation)
        this.chatService.messages$
            .pipe(takeUntil(this.destroy$))
            .subscribe(messages => {
                // For now, we'll implement a simple unread counter
                // In a full implementation, you'd track which messages were read
                this.unreadCount = 0; // Reset for demo - implement proper unread logic
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get isConnected(): boolean {
        return this.connectionStatus === ChatConnectionStatus.CONNECTED;
    }

    get isConnecting(): boolean {
        return this.connectionStatus === ChatConnectionStatus.CONNECTING ||
               this.connectionStatus === ChatConnectionStatus.RECONNECTING;
    }

    get hasError(): boolean {
        return this.connectionStatus === ChatConnectionStatus.ERROR;
    }

    get canOpenChat(): boolean {
        // Allow chat for both authenticated and unauthenticated users (demo mode)
        return this.connectionStatus !== ChatConnectionStatus.ERROR;
    }

    getChatIcon(): string {
        switch (this.connectionStatus) {
            case ChatConnectionStatus.CONNECTED:
                return 'chat';
            case ChatConnectionStatus.CONNECTING:
            case ChatConnectionStatus.RECONNECTING:
                return 'sync';
            case ChatConnectionStatus.ERROR:
                return 'error';
            default:
                return 'chat_bubble_outline';
        }
    }

    getTooltipText(): string {
        const suffix = this.isAuthenticated ? '' : ' - (No Login Required)';

        switch (this.connectionStatus) {
            case ChatConnectionStatus.CONNECTED:
                return 'Chat with AI assistant' + suffix;
            case ChatConnectionStatus.CONNECTING:
                return 'Connecting to chat...';
            case ChatConnectionStatus.RECONNECTING:
                return 'Reconnecting to chat...';
            case ChatConnectionStatus.ERROR:
                return 'AI Chat' + suffix;
            default:
                return 'AI Chat' + suffix;
        }
    }

    async openChat(): Promise<void> {
        console.log('Chat button clicked!');

        try {
            // Import the chat dialog component dynamically
            const { ChatDialogComponent } = await import('../chat-dialog/chat-dialog.component');

            // Responsive dialog configuration
            const isMobile = window.innerWidth <= 768;

            let dialogConfig: any = {
                hasBackdrop: true,
                backdropClass: 'chat-dialog-backdrop',
                panelClass: 'chat-dialog-panel',
                disableClose: false
            };

            if (isMobile) {
                // Full screen on mobile
                dialogConfig = {
                    ...dialogConfig,
                    width: '100vw',
                    height: '100vh',
                    maxWidth: '100vw',
                    maxHeight: '100vh',
                    position: { top: '0', left: '0' },
                    panelClass: ['chat-dialog-panel', 'chat-dialog-mobile']
                };
            } else {
                // Positioned dialog on desktop
                dialogConfig = {
                    ...dialogConfig,
                    width: '400px',
                    height: '600px',
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    position: {
                        bottom: '20px',
                        right: '20px'
                    }
                };
            }

            const dialogRef = this.dialog.open(ChatDialogComponent, dialogConfig);

            dialogRef.afterClosed().subscribe(result => {
                console.log('Chat dialog closed', result);
            });

        } catch (error) {
            console.error('Failed to load chat dialog:', error);
            // Fallback alert if dialog fails to load
            alert('Chat system is in demo mode. Dialog failed to load: ' + error);
        }
    }
}
