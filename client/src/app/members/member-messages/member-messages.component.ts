import { Component, inject, input, Input, OnInit, output, Output, ViewChild } from '@angular/core';
import { MessageService } from '../../_services/message.service';
import { Message } from '../../_models/message';
import { FormsModule, NgForm } from '@angular/forms';
import { BusyService } from '../../_services/busy.service';
import { NgFor } from '@angular/common';
import { AccountService } from '../../_services/account.service';

@Component({
  selector: 'app-member-messages',
  standalone: true,
  imports: [FormsModule, NgFor],
  templateUrl: './member-messages.component.html',
  styleUrl: './member-messages.component.css'
})
export class MemberMessagesComponent implements OnInit {
 
  @ViewChild('messageForm') messageForm?: NgForm;

  messageService = inject(MessageService);
  private accountService = inject(AccountService);
  username = input.required<string>();
  messages: Message[] = [];
  messageContent = '';
  updateMessages = output<Message>();
  webSocketService: any;
  intervalId: any;

  ngOnInit(): void {
       
    const user = this.accountService.currentUser();
    if(!user) return;

    this.lookForNewMessages(user);
  }

  sendMessage() {
    this.messageService.sendMessage(this.username(), this.messageContent).then(() => {
      this.messageForm?.reset();
    });

    this.messageForm?.reset();
  }

  lookForNewMessages(user: any) {

    this.messageService.createHubConnection(user, this.username());
  }

  ngOnDestroy(): void {

    this.messageService.stopHubConnection();
  }

}
