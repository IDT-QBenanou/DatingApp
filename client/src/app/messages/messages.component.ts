import { Component, inject, OnInit } from '@angular/core';
import { MessageService } from '../_services/message.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [FormsModule, RouterLink, NgFor, NgIf, PaginationModule, NgClass],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent implements OnInit {

  messageService = inject(MessageService);
  accountService = inject(AccountService);
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

  deleteMessage(id: number) {
    this.messageService.deleteMessage(id).subscribe({
      next: _ => {
        this.messageService.paginatedResult.update(prev =>{
          if(prev && prev.result) {
            prev.result.splice(prev.result.findIndex(m => m.id === id), 1);
            return prev;
          }
            return prev;
        })
      }
    })
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
