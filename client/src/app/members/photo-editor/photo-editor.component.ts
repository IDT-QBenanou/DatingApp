import { Component, inject, input, OnInit, output } from '@angular/core';
import { Member } from '../../_models/member';
import { FormsModule, NgForm } from '@angular/forms';
import { Photo } from '../../_models/photo';
import { DecimalPipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { FileUploader, FileUploadModule } from 'ng2-file-upload';
import { AccountService } from '../../_services/account.service';
import { environment } from '../../../environments/environment.development';
import { MembersService } from '../../_services/members.service';

@Component({
  selector: 'app-photo-editor',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, NgClass, FileUploadModule, DecimalPipe, NgStyle],
  templateUrl: './photo-editor.component.html',
  styleUrl: './photo-editor.component.css'
})
export class PhotoEditorComponent implements OnInit {
  ngOnInit(): void {
    this.initializeUploader();
  }

  private accountService = inject(AccountService);
  private memberService = inject(MembersService);
  member = input.required<Member>();

  uploader?: FileUploader;
  hasBaseDropZoneOver = false;
  baseUrl = environment.apiUrl;
  memberChange = output<Member>();


  deletePhoto(photoId: number) {
    this.memberService.deletePhoto(photoId).subscribe({
      next: () => {
        const updateMember = {...this.member()};
        updateMember.photos = updateMember.photos.filter(x => x.id !== photoId);
        this.memberChange.emit(updateMember);
      }
    });
  }

  fileOverBase(e: any) {
    this.hasBaseDropZoneOver = e;
  }

  setMainPhoto(photo: Photo) {
    this.memberService.setMainPhoto(photo.id).subscribe({
      next: () => {
        const user = this.accountService.currentUser();
        if(user) {
          user.photoUrl = photo.url;
          this.accountService.setCurrentUser(user);
        }
        const updateMember = {...this.member()};
        
        this.updateMainPhotoOnMember(updateMember, photo);
      }
    });
  }

  updateMainPhotoOnMember(updateMember: Member, photo: Photo) {
    updateMember.photoUrl = photo.url;
    updateMember.photos.forEach(p => {
      p.isMain = p.id === photo.id ? true : false;
    });
    this.memberChange.emit(updateMember);
    
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: this.baseUrl + 'users/add-photo',
      authToken: 'Bearer ' + this.accountService.currentUser()?.token,
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024
    });

    this.uploader.onAfterAddingFile = (file) => {file.withCredentials = false};

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if(response) {
        const photo: Photo = JSON.parse(response);
        const updateMember = {...this.member()};
        updateMember.photos.push(photo);
        this.memberChange.emit(updateMember);
        if(photo.isMain) {
          const user = this.accountService.currentUser();
          if(user) {
            user.photoUrl = photo.url;
            this.accountService.setCurrentUser(user);
          }
          this.updateMainPhotoOnMember(updateMember, photo);
        }

        // if(photo.isMain) {
        //   this.accountService.setCurrentUser(this.member);
        //   this.member().photoUrl = photo.url;
        // }
  }}
  }


}
