import { Component, inject } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-roles-modal',
  standalone: true,
  imports: [],
  templateUrl: './roles-modal.component.html',
  styleUrl: './roles-modal.component.css'
})
export class RolesModalComponent {

  bsModalRef = inject(BsModalRef);
  username='';
  title="";
  list: string[] = [];
  availableRole:  string[] = [];
  selectedRole: string[] = [];
  rolesUpdates = false;

  updateCheckedRoles(checkedValue: string) {
    
    if(this.selectedRole.includes(checkedValue)){
      this.selectedRole = this.selectedRole.filter(role => role !== checkedValue);
    } else {
      this.selectedRole.push(checkedValue);
    }
  }

  onSelectRoles(){
    this.rolesUpdates = true;
    this.bsModalRef.hide();
  }

  

}
