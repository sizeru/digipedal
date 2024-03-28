#include "shorttypes.h"
#include <stdio.h>

typedef struct {
	u32 numSamples;
	u16 numChannels;
	u16 bytesPerSample;
	u32 sampleRate;
	u32 position;
	FILE* fd;
} Wav;

Wav wavOpen(const char* filename);
u16 wavNext(Wav* wav);
void wavClose(Wav* wav);