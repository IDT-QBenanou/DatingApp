import { Component, inject, input, Input, OnInit, output, Output, ViewChild } from '@angular/core';
import { MessageService } from '../../_services/message.service';
import { Message } from '../../_models/message';
import { FormsModule, NgForm } from '@angular/forms';
import { BusyService } from '../../_services/busy.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-member-messages',
  standalone: true,
  imports: [FormsModule, NgFor],
  templateUrl: './member-messages.component.html',
  styleUrl: './member-messages.component.css'
})
export class MemberMessagesComponent implements OnInit {
 
  @ViewChild('messageForm') messageForm?: NgForm;

  private messageService = inject(MessageService);
  username = input.required<string>();
  messages: Message[] = [];
  messageContent = '';
  updateMessages = output<Message>();
  webSocketService: any;
  intervalId: any;

  ngOnInit(): void {
    this.loadMessages();
    this.lookForNewMessages();
  }

  loadMessages() {
    this.messageService.getMessageThread(this.username())
      .subscribe({
        next: (messages: Message[]) => {
          this.messages = messages;
        }
      });
  }

  sendMessage() {
    this.messageService.sendMessage(this.username(), this.messageContent)
      .subscribe({
        next: (message: Message) => {
          this.updateMessages.emit(message);
          this.messageForm?.reset();
          this.loadMessages();
        }
      });
  }

  // toutes les 5 secondes, regarde si il y a des nouveaux messages
  // si il y en a, les affiche

  lookForNewMessages() {

    // this.intervalId = setInterval(() => {
    //   this.loadMessages();
    //   console.log('Looking for new messages');
    // }, 5000
    // );
    // Cancel the interval when the component is destroyed
    
    // anuller l'interval
  }

  ngOnDestroy(): void {
    // if (this.intervalId) {
    // clearInterval(this.intervalId);
    // }
  }

}
