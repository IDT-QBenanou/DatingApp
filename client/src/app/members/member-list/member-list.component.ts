import { Component, inject, OnInit, Signal } from '@angular/core';
import { MembersService } from '../../_services/members.service';
import { MemberCardComponent } from "../member-card/member-card.component";
import { PaginationComponent, PaginationModule } from 'ngx-bootstrap/pagination';
import { AccountService } from '../../_services/account.service';
import { UserParams } from '../../_models/userParam';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [MemberCardComponent, PaginationModule, FormsModule],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.css'
})
export class MemberListComponent implements OnInit {

    private accountService = inject(AccountService);
    memberService = inject(MembersService);
    userParams = new UserParams(this.accountService.currentUser()!);
    genderFilterList = [{value: 'male', display: 'Hommes'}, {value: 'female', display: 'Femmes'}, {value: 'pingouin', display: 'Pingouins'}];

    ngOnInit(): void {

       // TODO : Fix Signal Member (la page member se recharge a chaque fois, alors qu'elle devrait etre stockée en mémoire par le signal)
      this.loadMembers();
    }

    loadMembers() {
      this.memberService.getMembers(this.userParams);
    }

    resetFilters() {
      this.userParams = new UserParams(this.accountService.currentUser()!);
      this.loadMembers();
    }

    pageChanged(event: any) {
      if(this.userParams.pageNumber === event.page) return;
      this.userParams.pageNumber = event.page;
      this.loadMembers();
    }

}
