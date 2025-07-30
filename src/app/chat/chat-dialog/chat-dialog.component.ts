import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, combineLatest } from 'rxjs';

import { ChatService } from '../../shared/service/chat.service';
import { ChatStorageService } from '../../shared/service/chat-storage.service';
import { MarkdownService } from '../../shared/service/markdown.service';
import { ChatMessage } from '../../shared/model/chat-message.model';
import { ChatSession, ChatConnectionStatus } from '../../shared/model/chat-session.model';

@Component({
    selector: 'app-chat-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatProgressBarModule,
        MatMenuModule,
        MatTooltipModule
    ],
    template: `
        <div class="chat-dialog-container">
            <!-- Header -->
            <div class="chat-header">
                <div class="chat-title">
                    <mat-icon class="ai-icon" [class.connected]="isConnected">smart_toy</mat-icon>
                    <div class="title-text">
                        <h3>AI Assistant</h3>
                        <span class="status-text">{{ getStatusText() }}</span>
                    </div>
                </div>

                <div class="header-actions">
                    <button mat-icon-button
                            matTooltip="New conversation"
                            (click)="startNewConversation()"
                            [disabled]="!isConnected">
                        <mat-icon>add</mat-icon>
                    </button>

                    <button mat-icon-button
                            [matMenuTriggerFor]="optionsMenu"
                            matTooltip="Options">
                        <mat-icon>more_vert</mat-icon>
                    </button>

                    <button mat-icon-button
                            mat-dialog-close
                            matTooltip="Close chat">
                        <mat-icon>close</mat-icon>
                    </button>
                </div>
            </div>

            <!-- Connection Progress Bar -->
            <mat-progress-bar
                *ngIf="isConnecting"
                mode="indeterminate"
                class="connection-progress">
            </mat-progress-bar>

            <!-- Messages Area -->
            <div class="messages-container" #messagesContainer>
                <div class="messages-list">
                    <!-- Welcome Message -->
                    <div *ngIf="messages.length === 0" class="welcome-message">
                        <mat-icon class="welcome-icon">waving_hand</mat-icon>
                        <h4>Hello! I'm your AI assistant</h4>
                        <p>I can help you with questions about our products, orders, or any other inquiries. How can I assist you today?</p>
                    </div>

                    <!-- Messages -->
                    <div *ngFor="let message of messages; trackBy: trackMessage"
                         class="message-wrapper"
                         [class.user-message]="message.sender === 'user'"
                         [class.ai-message]="message.sender === 'ai'">

                        <div class="message-bubble">
                            <div class="message-content"
                                 [class.markdown-content]="message.sender === 'ai' && containsMarkdown(message.content)">
                                <div *ngIf="message.sender === 'ai' && containsMarkdown(message.content)"
                                     [innerHTML]="getFormattedContent(message.content)">
                                </div>
                                <div *ngIf="!(message.sender === 'ai' && containsMarkdown(message.content))">
                                    {{ message.content }}
                                </div>
                            </div>
                            <div class="message-time">
                                {{ formatMessageTime(message.timestamp) }}
                            </div>
                        </div>
                    </div>

                    <!-- Typing Indicator -->
                    <div *ngIf="isTyping" class="message-wrapper ai-message">
                        <div class="message-bubble typing-indicator">
                            <div class="typing-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <div class="typing-text">AI is typing...</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Input Area -->
            <div class="input-container">
                <mat-form-field class="message-input" appearance="outline">
                    <mat-label>Type your message...</mat-label>
                    <input matInput
                           [(ngModel)]="currentMessage"
                           (keydown.enter)="sendMessage()"
                           [disabled]="!canSendMessage"
                           #messageInput
                           placeholder="Ask me anything about our products or services">
                </mat-form-field>

                <button mat-fab
                        color="primary"
                        class="send-button"
                        (click)="sendMessage()"
                        [disabled]="!canSendMessage || !currentMessage.trim()"
                        matTooltip="Send message">
                    <mat-icon>send</mat-icon>
                </button>
            </div>

            <!-- Error Display -->
            <div *ngIf="hasConnectionError" class="error-banner">
                <mat-icon>error</mat-icon>
                <span>Connection lost. Trying to reconnect...</span>
                <button mat-button (click)="retryConnection()">Retry</button>
            </div>
        </div>

        <!-- Options Menu -->
        <mat-menu #optionsMenu="matMenu">
            <button mat-menu-item (click)="clearConversation()">
                <mat-icon>clear_all</mat-icon>
                <span>Clear conversation</span>
            </button>
            <button mat-menu-item (click)="exportConversation()">
                <mat-icon>download</mat-icon>
                <span>Export conversation</span>
            </button>
        </mat-menu>
    `,
    styles: [`
        .chat-dialog-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            background: #fafafa;
        }

        .chat-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: white;
            border-bottom: 1px solid #e0e0e0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .chat-title {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .ai-icon {
            font-size: 28px;
            width: 28px;
            height: 28px;
            color: #666;
            transition: color 0.3s ease;
        }

        .ai-icon.connected {
            color: #4CAF50;
        }

        .title-text h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 500;
            color: #333;
        }

        .status-text {
            font-size: 12px;
            color: #666;
        }

        .header-actions {
            display: flex;
            gap: 4px;
        }

        .connection-progress {
            height: 2px;
        }

        .messages-container {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            min-height: 0;
        }

        .messages-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .welcome-message {
            text-align: center;
            padding: 32px 16px;
            color: #666;
        }

        .welcome-icon {
            font-size: 48px;
            width: 48px;
            height: 48px;
            color: #FFB74D;
            margin-bottom: 16px;
        }

        .welcome-message h4 {
            margin: 0 0 8px 0;
            color: #333;
        }

        .welcome-message p {
            margin: 0;
            line-height: 1.5;
        }

        .message-wrapper {
            display: flex;
            margin-bottom: 8px;
        }

        .message-wrapper.user-message {
            justify-content: flex-end;
        }

        .message-wrapper.ai-message {
            justify-content: flex-start;
        }

        .message-bubble {
            max-width: 80%;
            padding: 12px 16px;
            border-radius: 18px;
            position: relative;
            word-wrap: break-word;
        }

        .user-message .message-bubble {
            background: #2196F3;
            color: white;
            border-bottom-right-radius: 6px;
        }

        .ai-message .message-bubble {
            background: white;
            color: #333;
            border: 1px solid #e0e0e0;
            border-bottom-left-radius: 6px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .message-content {
            line-height: 1.4;
            margin-bottom: 4px;
        }

        .message-time {
            font-size: 11px;
            opacity: 0.7;
            text-align: right;
        }

        .ai-message .message-time {
            text-align: left;
        }

        .typing-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 16px;
            background: white;
            border: 1px solid #e0e0e0;
        }

        .typing-dots {
            display: flex;
            gap: 4px;
        }

        .typing-dots span {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #666;
            animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

        .typing-text {
            font-size: 12px;
            color: #666;
            font-style: italic;
        }

        @keyframes typing {
            0%, 80%, 100% {
                opacity: 0.3;
                transform: scale(0.8);
            }
            40% {
                opacity: 1;
                transform: scale(1);
            }
        }

        .input-container {
            display: flex;
            align-items: flex-end;
            gap: 12px;
            padding: 16px;
            background: white;
            border-top: 1px solid #e0e0e0;
        }

        .message-input {
            flex: 1;
        }

        .send-button {
            width: 48px;
            height: 48px;
            min-width: 48px;
        }

        .error-banner {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            background: #ffebee;
            color: #c62828;
            border-top: 1px solid #e0e0e0;
            font-size: 14px;
        }

        .error-banner mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
        }

        .error-banner button {
            margin-left: auto;
            color: #c62828;
        }

        /* Scrollbar styling */
        .messages-container::-webkit-scrollbar {
            width: 6px;
        }

        .messages-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
        }

        .messages-container::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
        }

        .messages-container::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
        }

        /* Markdown Content Styles */
        .markdown-content {
            line-height: 1.6;
        }

        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3,
        .markdown-content h4,
        .markdown-content h5,
        .markdown-content h6 {
            margin: 12px 0 6px 0;
            font-weight: 600;
            line-height: 1.25;
        }

        .markdown-content h1 { font-size: 1.3em; }
        .markdown-content h2 { font-size: 1.2em; }
        .markdown-content h3 { font-size: 1.1em; }

        .markdown-content p {
            margin: 6px 0;
        }

        .markdown-content .code-block {
            background: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 8px;
            margin: 8px 0;
            overflow-x: auto;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 0.85em;
            line-height: 1.3;
        }

        .markdown-content .inline-code {
            background: #f0f0f0;
            border-radius: 2px;
            padding: 1px 3px;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
            color: #d63384;
        }

        .markdown-content ul,
        .markdown-content ol {
            margin: 6px 0;
            padding-left: 16px;
        }

        .markdown-content li {
            margin: 2px 0;
        }

        .markdown-content blockquote {
            border-left: 3px solid #ddd;
            padding: 0 12px;
            margin: 8px 0;
            color: #666;
            font-style: italic;
        }

        .markdown-content a {
            color: #1976d2;
            text-decoration: none;
        }

        .markdown-content a:hover {
            text-decoration: underline;
        }

        .markdown-content strong {
            font-weight: 600;
        }

        .markdown-content em {
            font-style: italic;
        }

        .markdown-content table {
            border-collapse: collapse;
            width: 100%;
            margin: 8px 0;
            font-size: 0.9em;
        }

        .markdown-content th,
        .markdown-content td {
            border: 1px solid #ddd;
            padding: 6px 8px;
            text-align: left;
        }

        .markdown-content th {
            background: #f8f9fa;
            font-weight: 600;
        }

        /* Responsive Design */
        @media screen and (max-width: 768px) {
            .chat-dialog-container {
                height: 100vh;
            }

            .chat-header {
                padding: 12px 16px;
            }

            .title-text h3 {
                font-size: 16px;
            }

            .messages-container {
                padding: 12px;
            }

            .message-bubble {
                max-width: 85%;
                padding: 10px 12px;
                font-size: 14px;
            }

            .input-container {
                padding: 12px;
            }

            .send-button {
                width: 40px;
                height: 40px;
                min-width: 40px;
            }

            .welcome-message {
                padding: 24px 12px;
            }

            .welcome-icon {
                font-size: 36px;
                width: 36px;
                height: 36px;
            }
        }

        @media screen and (max-width: 480px) {
            .message-bubble {
                max-width: 90%;
                padding: 8px 10px;
                font-size: 13px;
            }

            .message-time {
                font-size: 10px;
            }

            .input-container {
                gap: 8px;
            }

            .markdown-content .code-block {
                font-size: 0.8em;
                padding: 6px;
            }

            .markdown-content .inline-code {
                font-size: 0.85em;
            }
        }
    `]
})
export class ChatDialogComponent implements OnInit, OnDestroy, AfterViewChecked {
    @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
    @ViewChild('messageInput') private messageInput!: ElementRef;

    private destroy$ = new Subject<void>();
    private shouldScrollToBottom = false;

    messages: ChatMessage[] = [];
    currentMessage = '';
    currentSession: ChatSession | null = null;
    connectionStatus = ChatConnectionStatus.DISCONNECTED;
    isTyping = false;

    constructor(
        private dialogRef: MatDialogRef<ChatDialogComponent>,
        private chatService: ChatService,
        private chatStorageService: ChatStorageService,
        private markdownService: MarkdownService
    ) {}

    ngOnInit(): void {
        // Subscribe to chat service observables
        combineLatest([
            this.chatService.currentSession$,
            this.chatService.messages$,
            this.chatService.connectionStatus$,
            this.chatService.isTyping$
        ]).pipe(takeUntil(this.destroy$))
        .subscribe(([session, messages, status, typing]) => {
            this.currentSession = session;
            this.messages = messages;
            this.connectionStatus = status;
            this.isTyping = typing;
            this.shouldScrollToBottom = true;
        });

        // Initialize chat session
        this.initializeChat().then(r => {});

        // Focus input after a short delay
        setTimeout(() => {
            if (this.messageInput) {
                this.messageInput.nativeElement.focus();
            }
        }, 100);
    }

    ngAfterViewChecked(): void {
        if (this.shouldScrollToBottom) {
            this.scrollToBottom();
            this.shouldScrollToBottom = false;
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private async initializeChat(): Promise<void> {
        try {
            // Try to get the current session or create a new one
            const storedSessionId = this.chatStorageService.getCurrentSessionId();

            if (storedSessionId) {
                // Load stored session messages
                const storedMessages = this.chatStorageService.getStoredMessages(storedSessionId);
                if (storedMessages.length > 0) {
                    // Create a mock session for stored messages
                    const session: ChatSession = {
                        id: storedSessionId,
                        userId: '',
                        title: 'Previous Conversation',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        messageCount: storedMessages.length,
                        isActive: true
                    };
                    // Load messages for existing sessions (they may have message history)
                    this.chatService.setCurrentSession(session, true);
                    return;
                }
            }

            // Create new session
            this.chatService.createSession({})
                .subscribe({
                    next: (session) => {
                        // Don't load messages for brand new sessions (they have none)
                        this.chatService.setCurrentSession(session, false);
                        this.chatStorageService.setCurrentSession(session.id);
                    },
                    error: (error) => {
                        console.error('Failed to create chat session:', error);
                    }
                });

        } catch (error) {
            console.error('Failed to initialize chat:', error);
        }
    }

    sendMessage(): void {
        if (!this.canSendMessage || !this.currentMessage.trim()) {
            return;
        }

        const message = this.currentMessage.trim();
        this.currentMessage = '';

        this.chatService.sendMessage(message);
        this.shouldScrollToBottom = true;

        // Focus back on input
        setTimeout(() => {
            if (this.messageInput) {
                this.messageInput.nativeElement.focus();
            }
        }, 100);
    }

    startNewConversation(): void {
        this.chatService.createSession({})
            .subscribe({
                next: (session) => {
                    // Don't load messages for brand new sessions
                    this.chatService.setCurrentSession(session, false);
                    this.chatStorageService.setCurrentSession(session.id);
                },
                error: (error) => {
                    console.error('Failed to create new session:', error);
                }
            });
    }

    clearConversation(): void {
        if (this.currentSession) {
            this.chatStorageService.clearSession(this.currentSession.id);
            this.messages = [];
            this.startNewConversation();
        }
    }

    exportConversation(): void {
        if (this.messages.length === 0) {
            return;
        }

        const conversationText = this.messages
            .map(msg => `${msg.sender.toUpperCase()}: ${msg.content}`)
            .join('\n\n');

        const blob = new Blob([conversationText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chat-conversation-${new Date().toISOString().split('T')[0]}.txt`;
        link.click();
        window.URL.revokeObjectURL(url);
    }

    retryConnection(): void {
        this.chatService.connect();
    }

    get isConnected(): boolean {
        return this.connectionStatus === ChatConnectionStatus.CONNECTED;
    }

    get isConnecting(): boolean {
        return this.connectionStatus === ChatConnectionStatus.CONNECTING ||
               this.connectionStatus === ChatConnectionStatus.RECONNECTING;
    }

    get hasConnectionError(): boolean {
        return this.connectionStatus === ChatConnectionStatus.ERROR;
    }

    get canSendMessage(): boolean {
        return this.isConnected && !!this.currentSession && !this.isTyping;
    }

    getStatusText(): string {
        switch (this.connectionStatus) {
            case ChatConnectionStatus.CONNECTED:
                return 'Online';
            case ChatConnectionStatus.CONNECTING:
                return 'Connecting...';
            case ChatConnectionStatus.RECONNECTING:
                return 'Reconnecting...';
            case ChatConnectionStatus.ERROR:
                return 'Connection error';
            default:
                return 'Offline';
        }
    }

    formatMessageTime(timestamp: Date): string {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    trackMessage(index: number, message: ChatMessage): string {
        return message.id;
    }

    containsMarkdown(content: string): boolean {
        return this.markdownService.containsMarkdown(content);
    }

    getFormattedContent(content: string): any {
        return this.markdownService.parseMarkdown(content);
    }

    private scrollToBottom(): void {
        try {
            if (this.messagesContainer) {
                const element = this.messagesContainer.nativeElement;
                element.scrollTop = element.scrollHeight;
            }
        } catch (err) {
            console.error('Error scrolling to bottom:', err);
        }
    }
}
