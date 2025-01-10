export class EmailConfig {
    constructor(
        public service: string = '',
        public host: string = '',
        public account: string = '',
        public password: string = ''
    ) { }
}