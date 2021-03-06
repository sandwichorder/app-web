import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { UUID } from 'angular2-uuid';

import { DataService } from '../../services/data.service';
/*
  Generated class for the Menu page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',

})

export class MenuPage implements OnInit {

  menu: any[] = [];
  searchFilter: string = "";
  errorMessage: any;

  displayMenu: any[] = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, public dataService: DataService) { }

  getMenu(): void {
    this.dataService.get("/categories")
      .subscribe((categories) => {

         this.dataService.get("/items")
           .subscribe(items => {

              this.menu = categories.map(category => {
                  return Object.assign(category, { 
                    items: items.filter(item => item.catId == category.id).sort( (a, b) => a.name > b.name ? 1 : -1)
                  })
              }).sort( (a, b) => a.name > b.name ? 1 : -1);
              this.displayableMenu();

        }, error => this.errorMessage = <any>error);

      }, error => this.errorMessage = <any>error);
  }
          
  displayableMenu():void{
     this.displayMenu = [];
    for(var cat of this.menu){
      let category:any = {};
      let newItems:any[]=[];
      for(var item of cat.items){
        if (item.name.toLowerCase().indexOf(this.searchFilter.toLowerCase()) > -1){
          newItems.push(item);
        }
      }
     // if (newItems.length > 0){
      category.name = cat.name;
      category.id = cat.id;
      category.items = newItems;
      this.displayMenu.push(category);//}
    }


    // return Object.assign([],this.menu).map(category => {
    //   return Object.assign(category, {
    //         items: Object.assign([], category.items).filter(item => item.name.toLowerCase().indexOf(this.searchFilter.toLowerCase()) > -1)
    //   })
    // }).filter(category => category.items.length > 0)
  }

  ngOnInit(): void {
    this.getMenu();
  }

  addCategoryPrompt() {
    let prompt = this.alertCtrl.create({
      title: 'Add Category',
      inputs: [
        {
          name: 'name',
          placeholder: 'Category'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => { }
        },
        {
          text: 'Save',
          handler: data => {
            data.id = UUID.UUID();
            this.dataService.post("/categories", data)
              .subscribe(data => {
                console.log(data);
                this.getMenu();
              }, error => this.errorMessage = <any>error);
          }
        }
      ]
    });
    prompt.present();
  }

  addCatItemPrompt(catId) {
    let prompt = this.alertCtrl.create({
      title: 'Add Item',
      inputs: [
        {
          name: 'name',
          placeholder: 'Name'
        },
        {
          name: 'price',
          placeholder: 'Price (£)',
          type: "number"
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => { }
        },
        {
          text: 'Save',
          handler: data => {
            if (!data.price) {
              this.addCatItemPrompt(catId);
              return;
            }
            data.id = UUID.UUID();
            data.catId = catId;
            this.dataService.post("/items", data)
              .subscribe(data => {
                console.log(data);
                this.getMenu();
              }, error => this.errorMessage = <any>error);;
          }
        }
      ]
    });
    prompt.present();
  }

  editCategory(cat) {
    let prompt = this.alertCtrl.create({
      title: 'Edit Category',
      inputs: [
        {
          name: 'name',
          value: cat.name
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => { }
        },
        {
          text: 'Save',
          handler: data => {
            data.id = cat.id;
            this.dataService.post("/categories", data)
              .subscribe(data => {
                console.log(data);
                this.getMenu();
              }, error => this.errorMessage = <any>error);;
          }
        }
      ]
    });
    prompt.present();
  }

  editItem(item) {
    let prompt = this.alertCtrl.create({
      title: 'Edit Item',
      inputs: [
        {
          name: 'name',
          value: item.name
        },
        {
          name: 'price',
          value: item.price,
          type: "number"
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => { }
        },
        {
          text: 'Save',
          handler: data => {
            if (!data.price) {
              this.editItem(item);
              return;
            }
            data.id = item.id;
            data.catId = item.catId;
            this.dataService.post("/items", data)
              .subscribe(data => {
                console.log(data);
                this.getMenu();
              }, error => this.errorMessage = <any>error);;
          }
        }
      ]
    });
    prompt.present();
  }

  removeItem(item) {
    this.dataService.delete("/items", item)
      .subscribe(data => {
        console.log(data);
        this.getMenu();
      }, error => this.errorMessage = <any>error);;
  }

  removeCategory(cat) {
    for (var item of cat.items) this.removeItem(item);
    this.dataService.delete("/categories", cat)
      .subscribe(data => {
        console.log(data);
        this.getMenu();
      }, error => this.errorMessage = <any>error);;
  }

  getItemPrice(item) {
    return item.hasOwnProperty('price') ? Number(item.price).toFixed(2) : Number(0).toFixed(2);
  }

}
