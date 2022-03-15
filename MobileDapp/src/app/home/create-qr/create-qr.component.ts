import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { ApiServiceService } from '../../../services/api-service.service';

@Component({
  selector: 'app-profile',
  templateUrl: './create-qr.component.html',
  styleUrls: ['./create-qr.component.scss'],
})
export class CreateQrComponent implements OnInit {

  // We can have Canvas/Img/Url as elementType
  elementType = NgxQrcodeElementTypes.URL;
  
  // We can have High/Low/Medium/Quartile
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  
  // Need to specify the valid account address
  value : string = '';

  constructor(private toastController: ToastController, private apiService: ApiServiceService, private modal: ModalController) { this.showQR()}

  ngOnInit() {}

  showQR(){
    let QRMetaData = {
      receiver: this.apiService.userAccount,
      username: this.apiService.username
    };
    this.value = JSON.stringify(QRMetaData);
    console.log(this.value)
  }

  back(){
    this.modal.dismiss()
  }

}
