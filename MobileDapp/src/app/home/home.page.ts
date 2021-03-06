import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { HomePageCards } from '../../models/home-cards.models';
import { ApiServiceService } from '../../services/api-service.service';
import { ContactsComponent } from './contacts/contacts.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit{
  
  cardRows = HomePageCards;
  userAccount : string = '';
  balanceData: any;
  balance: any;
  available: any;
  transactionCards = []
  transactions: any;
  username: string = ''

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private apiService: ApiServiceService,
    public loadingController: LoadingController
  ) {}
  
  ngOnInit(): void {
    // console.log("home init");
    this.username = this.apiService.username;
    this.userAccount = this.apiService.userAccount;
    this.getBalAndTransactions();
  }

  async cashInCashOut(id:string){
    switch(id){
      case "cashin":
        let alertController = await this.alertController.create({
          header: "Voucher",
          message: "Please enter voucher number ",
          inputs:[{
            name: 'voucherNumber',
            type: 'text',
            placeholder: 'Voucher number'
          }],
          buttons: [
            {
              text: 'CONFIRM',
              handler: () => {
                this.showProgressSpinner();
                this.apiService.postTopUp("500").subscribe(meta =>{
                  let data:any = meta;
                  console.log(data)
                  this.getBalAndTransactions();
                  this.loadingController.dismiss()
                });

              }
            },
          ]
        });
        await alertController.present();
        break;
      case "cashout":
        let alertControllerSecond = await this.alertController.create({
          header: "Scan QR",
          message: "Please scan the agents QR Code.",
          buttons: [
            {
              text: 'Proceed',
              handler: () => {
                this.displayModal(HomePageCards[0])
              }
            },
          ]
        });
        await alertControllerSecond.present();
        break;
    }
  }

  async displayModal(row:any){
    let componentToLoad;
    if (row == 'contacts'){
      componentToLoad = ContactsComponent
    }else{
      componentToLoad = row.component
    }
    const account = await this.modalController.create(
      {
        component: componentToLoad,
        showBackdrop: true,
        cssClass: "my-custom-modal-css",
        backdropDismiss: true,
        swipeToClose: true
      }
    );

    account.onDidDismiss().then(()=>{
      this.getBalAndTransactions();
      }
    )

    return await account.present()
  }

  async showProgressSpinner(){
    const loading = await this.loadingController.create({
      spinner: "bubbles",
      message: 'Loading account, please wait',
      translucent: false,
      backdropDismiss: false
    });
    await loading.present()
  }

  async approve(trans:any){
    let approve = await this.alertController.create({
      header: "Approve Escrow Payment?",
      message: "Please confirm payment should be released to receiver",
      buttons:[{
        text: "Confirm",
        handler: ()=>{
          this.showProgressSpinner()
          this.apiService.postEscrowClear(trans.counterAccount).subscribe(meta => {
            let data:any = meta;
            console.log(data)
            this.loadingController.dismiss()
            this.getBalAndTransactions()
          });
        }
      }, "Cancel"]
    });
    await approve.present();
  }

  getTransactions() {
    this.apiService.getTransactions().subscribe(meta =>{ 
      let data:any = meta;
      this.transactionCards = data['transactions'];
      console.log(data)
    });
  }

  updateBalance() {
    this.balanceData = this.apiService.getBalance().subscribe(meta =>{
      let data:any = meta;
      this.balance = data['balance'].accountBalance;
      this.available = data['balance'].availableBalance;
      console.log(data)
    });
  }

  getBalAndTransactions() { this.updateBalance(); this.getTransactions(); }

}