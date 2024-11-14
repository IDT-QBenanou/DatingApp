import { Component, inject, OnInit } from '@angular/core';
import { MessageService } from '../_services/message.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [FormsModule, RouterLink, NgFor, NgIf],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent implements OnInit {

  messageService = inject(MessageService);
  container = 'Inbox';
  pageNumber = 1;
  pageSize = 5;

  ngOnInit(): void {
    this.loadMessages(this.container);
  }

  loadMessages( container: string) {
    this.container = container;
    console.log(this.container);
    this.messageService.getMessages(this.pageNumber, this.pageSize, this.container);
  }

  getRoute(message: any) {
    if(this.container === 'Outbox') {
      return `/members/${message.recipientUsername}`;
    } else {
      return `/members/${message.senderUsername}`;
    }
  }

  pageChanged(event: any) {
  
      if(this.pageNumber !== event.page) {
        this.pageNumber = event.page;
        this.loadMessages(this.container);
      }

  }

}
