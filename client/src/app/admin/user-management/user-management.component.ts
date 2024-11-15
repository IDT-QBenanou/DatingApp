import { Component, inject, OnInit } from '@angular/core';
import { User } from '../../_models/user';
import { AdminService } from '../../_services/admin.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { RolesModalComponent } from '../../modals/roles-modal/roles-modal.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {

  private adminService = inject(AdminService);
  private modalService = inject(BsModalService);
  users: User[] = [];
  bsModalRef: BsModalRef<RolesModalComponent> = new BsModalRef<RolesModalComponent>();

  ngOnInit(): void {
    this.getUsersWithRoles();
  }

  openRolesModal(user: User) {
  
    const initialState: ModalOptions = {
      class: 'modal-lg',
      initialState: {
        title: 'Edit Roles',
        username: user.username,
        selectedRole: [...user.roles],
        availableRole: ['Admin', 'Moderator', 'Member'],
        users: this.users,
        rolesUpdates:false
      }
    }

    this.bsModalRef = this.modalService.show(RolesModalComponent, initialState);
    this.bsModalRef.onHide?.subscribe({
      next:() => {
        if (this.bsModalRef.content && this.bsModalRef.content.rolesUpdates) {
          const selectedRole = this.bsModalRef.content.selectedRole;
          this.adminService.updateUserRoles(user.username, selectedRole).subscribe({
            next: () => {
              user.roles = [...selectedRole];
            }
          });
        }
      }
    });

  }


  getUsersWithRoles() {
    this.adminService.getUserWithRoles().subscribe({
      next: users => this.users = users
    });
  }

}
