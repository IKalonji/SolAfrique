import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";

import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { ApiServiceService } from '../services/api-service.service';

import { ADAPTER_EVENTS } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { Web3Auth } from "@web3auth/web3auth";

import { CHAIN_CONFIG, CHAIN_CONFIG_TYPE } from "./../config/chains";
import { WEB3AUTH_NETWORK_TYPE } from "./../config/web3auth-networks";
import { getWalletProvider, IWalletProvider } from "./../services/wallet-provider";
import { environment } from "src/environments/environment";

const clientId = "BKPxkCtfC9gZ5dj-eg-W6yb5Xfr3XkxHuGZl2o2Bn8gKQ7UYike9Dh6c-_LaXlUN77x0cBoPwcSx-IVm0llVsLA";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit{
  title = "angular-app";

  chain: CHAIN_CONFIG_TYPE = "mainnet";

  network: WEB3AUTH_NETWORK_TYPE = "cyan";

  isLoggedIn = false;

  signedIn: boolean = false;

  domain: any = "none@none.none";

  web3auth: Web3Auth | null = null;

  isModalLoaded = false;

  provider: IWalletProvider | null = null;

  constructor(public loadingController: LoadingController,
    private apiService: ApiServiceService,
    ) {
      this.web3auth = new Web3Auth({
        clientId,
        chainConfig: CHAIN_CONFIG[this.chain],
      });
      this.initAppToBackend()
    }
  ngOnInit(): void {

    const subscribeAuthEvents = (web3auth: Web3Auth) => {
      web3auth.on(ADAPTER_EVENTS.CONNECTED, (data) => {
        console.log("Yeah!, you are successfully logged in", data);
        this.setLoginStatus(true);
      });

      web3auth.on(ADAPTER_EVENTS.CONNECTING, () => {
        console.log("connecting");
      });

      web3auth.on(ADAPTER_EVENTS.DISCONNECTED, () => {
        console.log("disconnected");
        this.setLoginStatus(false);
      });

      web3auth.on(ADAPTER_EVENTS.ERRORED, (error) => {
        console.log("some error or user have cancelled login request", error);
      });
    };

    const initializeModal = async () => {
      console.log("INIT MODAL");
      this.web3auth = new Web3Auth({
        clientId,
        chainConfig: CHAIN_CONFIG[this.chain],
      });
      const adapter = new OpenloginAdapter({ adapterSettings: { network: this.network, clientId } });
      this.web3auth.configureAdapter(adapter);

      subscribeAuthEvents(this.web3auth);
      await this.web3auth.initModal();
      this.isModalLoaded = true;

      if (this.isLoggedIn && !this.provider) {
        const web3authProvider = await this.web3auth.connect();
        if (web3authProvider) this.provider = getWalletProvider(this.chain, web3authProvider, this.uiConsole);
      }
    };
    initializeModal();
  }

  selectChain(chain: string) {
    this.chain = chain as CHAIN_CONFIG_TYPE;
  }

  selectNetwork(network: string) {
    this.network = network as WEB3AUTH_NETWORK_TYPE;
  }

  setLoginStatus(status: boolean) {
    this.isLoggedIn = status;
  }

  initAppToBackend(){
    this.showProgressSpinner('Initializing, please wait')
    this.apiService.initializeFrontendWithTatumAPI_KEY().subscribe(meta =>{
      let data:any = meta;
      console.log(data);
      let result:string = data['response']
      let message = data['message']
      if (result.toLowerCase() == 'ok'){
        this.loadingController.dismiss();
      }else{ 
        this.showProgressSpinner('An error occurred, close the app!')
      }
      this.loadingController.dismiss();
    })
  }

  async showProgressSpinner(info:string){
    const loading = await this.loadingController.create({
      spinner: "bubbles",
      message: info,
      translucent: false,
      backdropDismiss: false
      }
    );
    if (this.signedIn == true){
      loading.dismiss();
    }
    await loading.present()
  }
  
  async setAccount(user:any){
    this.showProgressSpinner('Loading/Resolving account, please wait');
    this.apiService.getUser(user).subscribe(
      meta => {
        let data:any = meta;
        console.log(data)
        this.signedIn = this.apiService.setUsernameAndAccount(data['account_metadata'].customer_id, data['account_metadata'].account_id)
        this.loadingController.dismiss();
      }
    );
  }

  async login() {
    console.log("LOGGING IN");
    if (!this.web3auth) {
      console.log("Web3auth is not initialized");
      return;
    }
    const web3authProvider = await this.web3auth.connect();
    if (web3authProvider){
      this.provider = getWalletProvider(this.chain, web3authProvider, this.uiConsole);
      console.log(this.provider)
      this.getUserInfo();
    } 
  }

  async logout() {
    console.log("LOGGING OUT");
    if (!this.web3auth) {
      console.log("Web3auth is not initialized");
      return;
    }
    await this.web3auth.logout();
    this.provider = null;
    this.signedIn = false;
  }

  async getUserInfo() {
    console.log("GETTING USER INFO");
    if (!this.web3auth) {
      console.log("Web3auth is not initialized");
      return;
    }
    const userInfo = await this.web3auth.getUserInfo();
    console.log(userInfo)
    let user = userInfo.email;
    console.log(this.domain)
    this.setAccount(user);
    this.uiConsole("User Info", userInfo);
  }

  async getBalance() {
    console.log("GETTING ACCOUNT BALANCE");
    if (!this.provider) {
      this.uiConsole("provider is not initialized");
      return;
    }
    this.provider.getBalance();
  }

  async getAccount() {
    console.log("GETTING ACCOUNT");
    if (!this.provider) {
      this.uiConsole("provider is not initialized");
      return;
    }
    this.provider.getAccounts();
  }

  async signMessage() {
    console.log("SIGNING MESSAGE");
    if (!this.provider) {
      this.uiConsole("provider is not initialized");
      return;
    }
    this.provider.signMessage();
  }

  uiConsole(...args: unknown[]): void {
    const el = document.querySelector("#console-ui>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

}
