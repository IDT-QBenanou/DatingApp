import { Component, inject } from '@angular/core';
import { DxBulletModule, DxButtonModule, DxDataGridModule, DxTemplateModule } from 'devextreme-angular';
import { MemberListComponent } from '../members/member-list/member-list.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { UserParams } from '../_models/userParam';
import { AccountService } from '../_services/account.service';
import { MembersService } from '../_services/members.service';
import { MemberCardComponent } from "../members/member-card/member-card.component";
import { JsonPipe, NgIf } from '@angular/common';
import { DxoPagerModule, DxoPagingModule } from 'devextreme-angular/ui/nested';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [DxButtonModule, MemberListComponent, PaginationModule, MemberCardComponent, DxDataGridModule, JsonPipe, DxTemplateModule, DxBulletModule, DxoPagerModule, DxoPagingModule, FormsModule, NgIf],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})

export class ListComponent {

  helloWorld() {
    alert('Hello World!');
  }

  private accountService = inject(AccountService);
    memberService = inject(MembersService);
    userParams = new UserParams(this.accountService.currentUser()!);
    
    genderFilterList = [{value: 'male', display: 'Hommes'}, {value: 'female', display: 'Femmes'}, {value: 'pingouin', display: 'Pingouins'}, {value: 'all', display: 'Tous'}];

    ngOnInit(): void {
      this.userParams.gender = "all";
      this.loadMembers();
    }

    loadMembers() {
      this.userParams.pageSize = 1000;
      this.memberService.getMembers(this.userParams);

      console.log(this.userParams);
    }

    resetFilters() {
      this.userParams = new UserParams(this.accountService.currentUser()!);
      this.userParams.gender = "all";
      this.loadMembers();
    }

    pageChanged(event: any) {
      if(this.userParams.pageNumber === event.page) return;
      this.userParams.pageNumber = event.page;
      this.loadMembers();
    }


}
