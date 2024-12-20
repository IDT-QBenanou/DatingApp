import { inject, Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class BusyService {

  busyRequestCount = 0;
  private spinnerService = inject(NgxSpinnerService);

  busy() {
    this.busyRequestCount++;

    //get page url
    
    const pageUrl = window.location.href;

    if(!pageUrl.includes('members')) {
      this.spinnerService.show(undefined, {
        type: 'ball-spin-clockwise',
        bdColor: 'rgba(255,255,255,0.7)',
        color: '#333333'
      });
    }
  }

  idle() {
    this.busyRequestCount--;
    if (this.busyRequestCount <= 0) {
      this.busyRequestCount = 0;
      this.spinnerService.hide();
    }
  }
}
