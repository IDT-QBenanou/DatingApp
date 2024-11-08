import { Component, EventEmitter, inject, input, Input, OnInit, output, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { JsonPipe, NgFor } from '@angular/common';
import { TextInputComponent } from "../_forms/text-input/text-input.component";
import { DatePickerComponent } from "../_forms/date-picker/date-picker.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, JsonPipe, TextInputComponent, DatePickerComponent, NgFor],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  private accountService = inject(AccountService);
  private formBuilder = inject(FormBuilder);
  usersFromHomeComponent = input<any>();
  private toastr = inject(ToastrService);

  private router = inject(Router);

  cancelRegister = output<boolean>();

  registerForm: FormGroup = new FormGroup({});

  validationErrors: string[] = [];

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.registerForm = this.formBuilder.group({
      gender: ['pingouin'],
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]]
    });
    this.registerForm.controls['password'].valueChanges.subscribe({
      next: () => this.registerForm.controls['confirmPassword'].updateValueAndValidity()
    });
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value === control.parent?.get(matchTo)?.value ? null : {isMatching: true}
      
    }
  }

  register() {
    const dateOfBirthDateOnly = this.getDateOnly(this.registerForm.get('dateOfBirth')?.value);
    this.registerForm.patchValue({dateOfBirth: dateOfBirthDateOnly});
    this.accountService.register(this.registerForm.value).subscribe({
      next: _ => {
        this.router.navigateByUrl('/members'),
        this.toastr.success('Registration successful');
      },
      error: error => {
        console.log(error),
        this.validationErrors = error;
      }
    })

    console.log(this.registerForm.value);
  }

  cancel() {
    this.cancelRegister.emit(false);
  }

  private getDateOnly(date: string | undefined) {
    if (date) {
      return new Date(date).toISOString().slice(0, 10);
    }else {
      return null;
    }
  }
}
