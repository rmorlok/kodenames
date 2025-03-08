import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audio: { [key: string]: HTMLAudioElement } = {};

  constructor() {
    // Pre-load sounds
    this.audio['ding'] = new Audio('/assets/sounds/ding.mp3');
  }

  playDing() {
    this.audio['ding'].currentTime = 0; // Reset the audio to start
    this.audio['ding'].play().catch(error => {
      console.warn('Audio playback failed:', error);
    });
  }
} 