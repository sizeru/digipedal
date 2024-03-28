// This file parses WAV files.
// For now, they must be 44.1kHz, 1 channel, 16-bit audio files
// Made with help from https://www.videoproc.com/resource/wav-file.htm
#include "wav.h"

Wav wavOpen(const char* filename) {
	Wav wavMetadata;
	FILE* fd = fopen(filename, "r");
	char wavHeader[44];
	fread(wavHeader, 1, 44, fd);
	wavMetadata.numChannels = *(u16*)(wavHeader + 22);
	wavMetadata.sampleRate = *(u32*)(wavHeader + 24);
	wavMetadata.bytesPerSample = *(u16*)(wavHeader + 34) / 8;
	wavMetadata.numSamples = *(u32*)(wavHeader + 40) / wavMetadata.bytesPerSample / wavMetadata.numChannels;
	wavMetadata.fd = fd;
	wavMetadata.position = 0;
	return wavMetadata;
}

u16 wavNext(Wav* wav) {
	static char wavNextBuffer[2];
	fread(&wavNextBuffer, 2, 1, wav->fd);
	return *(u16*)(wavNextBuffer);
}

void wavClose(Wav* wav) {
	fclose(wav->fd);
}