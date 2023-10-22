import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';

declare const Recorder: any;
declare const Oscilloscope: any;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {
  @ViewChild('myCanvas')
  myCanvas: ElementRef<HTMLCanvasElement> | undefined;

  public conversations: Array<any> = [];
  public messages: Array<any> = [];
  public loadingData = true;
  public loadingMessages = false;
  public conversation_selected: any;
  public message_type: String = 'text';
  public message_str: String = '';
  public message_url: String = '';
  public image_file: any = undefined;
  public audio_file: any = undefined;
  public dataRaw: any = {};

  /**Variables para Audio */
  public gumStream: any = ''; //stop recording
  public rec: any = {};
  public input: any = {};
  public AudioContext =
    (window as any).AudioContext || (window as any).webKitAudioContext;
  public ctx: any = {};

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

  getMessages(id: String, isFast: boolean = false) {
    this.loadingMessages = !isFast ? true : false;
    this.loadingData = !isFast ? true : false;
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
      this.loadingMessages = !isFast ? false : false;
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
      case 'audio':
        this.dataRaw.content = {
          audio: {
            url: this.message_url
          },
        };
        break;

      default:
        break;
    }

    this._chatService.sendMessage(this.dataRaw).subscribe(async (response) => {
      console.log(response);
      this.cleanUpload();
      await this.delay(2000);
      this.getMessages(this.conversation_selected.id, true);
      // console.log(this.messages);
    });
  }

  getImage(evt: any) {
    const file = evt.target.files[0];

    if (!file) throw new Error('No se pudo crear el archivo de imagen.');
    if (file.size >= 2100000) {
      this.image_file = undefined;
      throw new Error('El archivo de imagen es demasiado grande. Máximo 2Mb.');
    }

    if (
      file.type != 'image/png' &&
      file.type != 'image/jpg' &&
      file.type != 'image/jpeg' &&
      file.type != 'image/webp'
    )
      throw new Error(
        'El archivo de imagen no es del formato permitido (jpg, jpeg, png, webp).'
      );

    this.image_file = file;
    this.message_type = 'image';
    this.uploadFile(this.image_file);

    console.log(this.image_file);
  }

  uploadFile(file: any) {
    this._chatService.uploadFile({ file: file }).subscribe((response) => {
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

  cleanAudioRecord() {
    this.audio_file = undefined;
    this.message_url = '';
    this.gumStream = ''; //stop recording
    this.rec = {};
    this.input = {};
    this.ctx = {};
  }

  startRecording() {
    this.cleanAudioRecord();
    this.message_type = 'audio';
    const constraints = { audio: true, video: false };
    navigator.mediaDevices.getUserMedia(constraints).then((stream: any) => {
      console.log(stream);
      this.ctx = new this.AudioContext();
      this.gumStream = stream;
      this.input = this.ctx.createMediaStreamSource(stream);
      this.rec = new Recorder(this.input, { numChannels: 1 });

      const ctx: any = this.myCanvas?.nativeElement.getContext('2d');
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#B5B5C3';

      const scope = new Oscilloscope(this.input);
      scope.animate(ctx);

      this.rec.record();
    });
  }

  stopRecording() {
    this.rec.stop();
    this.gumStream.getAudioTracks()[0].stop();
    this.rec.exportWAV(this.createDownloadLink);
  }

  createDownloadLink = (blob: any) => {
    const url = URL.createObjectURL(blob);
    const au = document.createElement('audio');
    au.controls = true;
    au.src = url;

    /**create audio file */
    const file = new File([blob], 'audio.mp3');
    console.log({ file });
    if (!file) throw new Error('No se pudo crear el archivo de audio.');

    this.audio_file = file;
    this.uploadFile(this.audio_file);
  };
}
