"use client"

import type { AlarmSound } from "@/hooks/useAlarmStore";

const soundFiles: Record<AlarmSound, string> = {
    classic: 'https://cdn.pixabay.com/audio/2022/03/15/audio_2b1154b725.mp3', // Classic Alarm
    digital: 'https://cdn.pixabay.com/audio/2022/11/17/audio_88c140a322.mp3', // Digital Beep
    gentle: 'https://cdn.pixabay.com/audio/2021/10/01/audio_51a2935824.mp3',  // Gentle Wake-up
    none: '',
};

let currentAudio: HTMLAudioElement | null = null;

export function playSound(sound: AlarmSound) {
    if (typeof window === 'undefined' || sound === 'none') {
        return;
    }

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    const audio = new Audio(soundFiles[sound]);
    audio.play().catch(error => {
        console.error("Failed to play audio:", error);
    });
    currentAudio = audio;
}

export function stopSound() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
}
