import { Component, inject, OnInit, Signal } from '@angular/core';
import { MembersService } from '../../_services/members.service';
import { MemberCardComponent } from "../member-card/member-card.component";
import { PaginationComponent, PaginationModule } from 'ngx-bootstrap/pagination';
import { AccountService } from '../../_services/account.service';
import { UserParams } from '../../_models/userParam';
import { FormsModule } from '@angular/forms';
import { LikesService } from '../../_services/likes.service';
import { Member } from '../../_models/member';
import { DxDataGridModule } from 'devextreme-angular';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [MemberCardComponent, PaginationModule, FormsModule, DxDataGridModule],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.css'
})
export class MemberListComponent implements OnInit {

    private accountService = inject(AccountService);
    private likeService = inject(LikesService);
    predicate = 'liked';
    members: Member[] = [];
    memberService = inject(MembersService);

    members_a_afficher = "liste";

    userParams = new UserParams(this.accountService.currentUser()!);
    genderFilterList = [{value: 'male', display: 'Hommes'}, {value: 'female', display: 'Femmes'}, {value: 'pingouin', display: 'Pingouins'}];

    ngOnInit(): void {
      this.loadMembers();
    }

    loadMembers() {

      this.memberService.getMembers(this.userParams);
      
    }

    retourListe() {
      this.members_a_afficher = "liste";
      this.loadMembers();
    }


    loadLikes(predicate: string) {
      console.log(this.predicate);
      this.predicate = predicate;
      this.members_a_afficher = "likes";
      this.likeService.getLikes(this.predicate).subscribe({
        next: members => {
          this.members = members;
        }
      })
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
