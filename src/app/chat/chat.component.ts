import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Channel } from 'twilio-chat/lib/channel';
import { ChatService } from '../services/chat.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Message } from 'twilio-chat/lib/message';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  public isConnected = false;
  public isConnecting = false;
  public isGettingChannels = false;
  public channels: any[] = [];
  public channelObj: any;
  public chatMessage: string;
  public currentChannel: Channel;
  public typeObservable: any;
  public messages: Message[] = [];
  public currentUsername: string = localStorage.getItem('twackUsername');
  public isMemberOfCurrentChannel = false;
  public membersTyping: any = [];

  private conSub: any;
  private disconSub: any;

  @ViewChild('chatElement') chatElement: any;
  @ViewChild('chatDisplay') chatDisplay: any;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.isConnecting = true;
    this.chatService.connect(localStorage.getItem('twackToken'));

    this.conSub = this.chatService.chatConnectedEmitter.subscribe(() => {
      this.isConnected = true;
      this.isConnecting = false;
      this.getChannels();

      this.chatService.chatClient.on('channelAdded', () => {
        this.getChannels();
      });
      this.chatService.chatClient.on('channelRemoved', () => {
        this.getChannels();
      });
      this.chatService.chatClient.on('tokenExpired', () => {
        this.authService.refreshToken();
      });
    })

    this.disconSub = this.chatService.chatDisconnectedEmitter.subscribe(() => {
      this.isConnecting = false;
      this.isConnected = false;
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigateByUrl('');
  }


  getChannels() {
    this.isGettingChannels = true;
    this.chatService.getPublicChannels().then((channels: any) => {
      console.log('getting al channels', channels);
      this.channelObj = channels;
      this.channels = this.channelObj.items;
      console.log(channels);
      this.isGettingChannels = false;
      /* clean em up
      this.channels.forEach( c => {
        this.chatService.getChannel(c.sid).then(ch => {
          ch.delete();
        })
      })
      */
    });
  }

  leaveChannel() {
    if (this.typeObservable) {
      this.typeObservable.unsubscribe();
    }
    if (this.currentChannel) {
      return this.currentChannel.leave().then((channel: Channel) => {
        channel.removeAllListeners('messageAdded');
        channel.removeAllListeners('typingStarted');
        channel.removeAllListeners('typingEnded');
      });
    }
    else {
      return Promise.resolve();
    }
  }

  enterChannel(sid: string) {
    this.messages = [];
    this.membersTyping = [];


    this.chatService.getChannel(sid).then(channel => {
      console.log('SID', sid);
      console.log(' current channel', channel);
      this.currentChannel = channel;
      console.log(channel);
      this.currentChannel.join()
        .then(r => {
          this.initChannel();
        })
        .catch(e => {
          if (e.message.indexOf('already exists') > 0) {
            this.initChannel();
          }
        });
    });




    // this.leaveChannel()
    //   .then(() => {
    //     this.chatService.getChannel(sid).then( channel => {
    //       console.log('SID', sid);
    //       console.log(' current channel', channel);
    //       this.currentChannel = channel;
    //       console.log(channel);
    //       this.currentChannel.join()
    //         .then( r => {
    //           this.initChannel();
    //         })
    //         .catch( e => {
    //           if( e.message.indexOf('already exists') > 0 ) {
    //             this.initChannel();
    //           }
    //         });
    //     });
    //   });
  }

  initChannel() {
    /* this.typeObservable = Observable.fromEvent(this.chatElement.nativeElement, 'keyup').debounceTime(100).subscribe(() => {
      this.typing();
    }); */

    this.currentChannel.on('messageAdded', (m) => {
      console.log('messages', m);
      this.messages.push(m);
      console.log('the message array', this.messages);
      const el = this.chatDisplay.nativeElement;
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      });
    });
    this.currentChannel.on('typingStarted', (m) => {
      this.membersTyping.push(m);
    });
    this.currentChannel.on('typingEnded', (m) => {
      const mIdx = this.membersTyping.findIndex(mem => mem.identity === m.identity);
      this.membersTyping = this.membersTyping.splice(mIdx, 0);
    });
  }

  typing() {
    this.currentChannel.typing();
  }

  whosTyping() {
    return this.membersTyping.map(m => {
      if (m.identity !== this.currentUsername) {
        return m.identity;
      }
    }).join(', ');
  }

  sendMessage() {
    console.log('the chat message', this.chatMessage);
    this.currentChannel.sendMessage(this.chatMessage);
    this.chatMessage = null;
  }

  createChannel() {
    this.chatService.createChannel(`Channel ${this.channels.length + 1}`);
    return false;
  }

  ngOnDestroy() {
    this.conSub.unsubscribe();
    this.disconSub.unsubscribe();
  }
}
