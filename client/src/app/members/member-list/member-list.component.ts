import { Component, inject, OnInit } from '@angular/core';
import { MembersService } from '../../_services/members.service';
import { MemberCardComponent } from "../member-card/member-card.component";

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [MemberCardComponent],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.css'
})
export class MemberListComponent implements OnInit {

    memberService = inject(MembersService);

    ngOnInit(): void {

      console.log("Debug : " + this.memberService.members.length + " membres dans le tableau");

       // TODO : Fix Signal Member (la page member se recharge a chaque fois, alors qu'elle devrait etre stockée en mémoire par le signal)
      if(this.memberService.members.length === 0) this.loadMembers();
    }

    loadMembers() {
      this.memberService.getMembers()
    }

}
