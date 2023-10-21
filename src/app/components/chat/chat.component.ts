import { Component } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {
  public conversations: Array<any> = [];
  public messages: Array<any> = [];
  public loadingData = true;
  public loadingMessages = false;
  public conversation_selected: any;
  public message_type: String = 'text';
  public message_str: String = '';
  public message_url: String = '';
  public image_file: any = undefined;
  public dataRaw: any = {};

  constructor(private _chatService: ChatService) {}

  ngOnInit(): void {
    this.getConversations();
  }

  scrollToBottom() {
    setTimeout(() => {
      const contentDiv: any = document.getElementById('chat-body');
      if (contentDiv) contentDiv.scrollTop = contentDiv?.scrollHeight;
    }, 150);
  }

  getConversations() {
    this.loadingData = true;
    this._chatService.getConversations().subscribe((response) => {
      this.conversations = response.data.items;
      this.loadingData = false;
      console.log(this.conversations);
    });
  }

  selectedConversation(item: any) {
    this.conversation_selected = item;
    console.log('seleccionado', this.conversation_selected);
    this.getMessages(item.id);
    this.cleanUpload();
  }

  getMessages(id: String) {
    this.loadingMessages = true;
    this.loadingData = true;
    this._chatService.getMessages(id).subscribe(async (response) => {
      this.messages = [];
      let item: any;
      response.data.items.forEach((item: any) => {
        if (item.status == 'received' || item.status == 'pending') {
          this.messages.push(item);
        }
      });

      this.loadingData = false;
      this.messages.sort((a: any, b: any) => {
        const date_a = new Date(a.createdDatetime).getTime();
        const date_b = new Date(b.createdDatetime).getTime();
        return date_a - date_b;
      });
      console.log(this.messages);
      this.scrollToBottom();
      this.loadingMessages = false;
      await this.delay(1000);
      await this.delay(1000);
      await this.delay(1000);
    });
  }

  delay(time: number) {
    this.scrollToBottom();
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  sendMessage() {
    this.dataRaw = {
      to: this.conversation_selected.contact.displayName,
      from: 'e289a62e0c0144598ff2281992eff6b8',
      type: this.message_type,
    };

    switch (this.message_type) {
      case 'text':
        this.dataRaw.content = {
          text: this.message_str,
          disableUrlPreview: false,
        };
        break;
      case 'image':
        this.dataRaw.content = {
          image: {
            url: this.message_url,
            caption: 'Image Resource',
          },
        };
        break;

      default:
        break;
    }

    this._chatService.sendMessage(this.dataRaw).subscribe(async (response) => {
      console.log(response);
      this.cleanUpload();
      await this.delay(3000);
      this.getMessages(this.conversation_selected.id);
      // console.log(this.messages);
    });
  }

  getImage(evt: any) {
    const file = evt.target.files[0];

    if (file) {
      if (file.size <= 2100000) {
        if (
          file.type == 'image/png' ||
          file.type == 'image/jpg' ||
          file.type == 'image/jpeg' ||
          file.type == 'image/webp'
        ) {
          this.image_file = file;
          this.message_type = 'image';
          this.uploadFile();
        }
      } else {
        this.image_file = undefined;
      }

      console.log(this.image_file);
    }
  }

  uploadFile() {
    this._chatService
      .uploadFile({ file: this.image_file })
      .subscribe((response) => {
        console.log(response);
        this.message_url = response.data;
      });
  }

  cleanUpload() {
    this.image_file = undefined;
    this.message_type = 'text';
    this.message_str = '';
    this.message_url = '';
  }
}
