import { User } from './user';

export class UserParams {
    gender: string;
    minAge = 18;
    maxAge = 99;
    pageNumber = 1;
    pageSize = 20;

    constructor(user: User) {
        switch (user?.gender) {
            case "male":
                this.gender = "female";
                break;
            case "female":
                this.gender = "male";
                break;
            default:
                this.gender = "pingouin"
        }
    }
}

// set gender

