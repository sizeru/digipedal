#include "portaudio.h"
#include "shorttypes.h"
#include <asm/unistd_64.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <sys/mman.h>
#include "effects.h"
#include "wav.h"

#define EXEC_NAME "synth"

// Syscall to create a file (in RAM) which can be used for MMIO. Used to create
// a circular buffer. Created with help from
// https://lo.calho.st/posts/black-magic-buffer/ and
// https://benjamintoll.com/2022/08/21/on-memfd_create/#memfd_create
int memfd_create(const char* name, u32 flags) {
	return syscall(__NR_memfd_create, name, flags);
}

typedef enum : u8 {
	CONFIG_OK,
	CONFIG_INVALID_EXEC_NAME
} UsageStatus;

typedef struct {
	size_t bufferSize;
} SynthConfig;

void initDefaultConfig(SynthConfig* config);
UsageStatus parseOptions(int argc, char* argv[], SynthConfig* config);
void printUsage();
s16 getInputAmplitude();

// Start up the synthesizer and synth server
int main(int argc, char* argv[]) {
	SynthConfig config;
	initDefaultConfig(&config);
	if (CONFIG_OK != parseOptions(argc, argv, &config)) {
		printUsage();
		return -1;
	}

	// Allocate enough space for not only the buffer, but also do circular mapping
	// on the buffer.
	int pagesize = getpagesize();
	// round up size of buffer to nearest pagesize
	int bufferSize = ((config.bufferSize + (pagesize-1)) & ~(pagesize-1));
	int bufferFD = memfd_create("circular_buffer", 0);
	ftruncate(bufferFD, bufferSize);

	/* Create circular memory mapped buffer*/
	// Get an address with space for all 3 virtual copies
	s16* buffer = mmap(NULL, 3 * bufferSize, PROT_NONE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
	size_t bufferLength = bufferSize/2;
	// Map the buffer at the actual address
	(void) mmap(buffer + bufferLength, bufferSize, PROT_READ | PROT_WRITE, MAP_SHARED | MAP_FIXED, bufferFD, 0);
	// Map the virtual page at the buffer before and after
	(void) mmap(buffer, bufferSize, PROT_READ | PROT_WRITE, MAP_SHARED | MAP_FIXED, bufferFD, 0);
	(void) mmap(buffer + 2*bufferLength, bufferSize, PROT_READ | PROT_WRITE, MAP_SHARED | MAP_FIXED, bufferFD, 0);
	buffer = buffer + bufferLength;
	memset(buffer, 0, bufferSize);

	// Create an array of effects
	void(*effect[64])();
	u8 effectCount = 0;
	size_t maxEffects = sizeof(effect);
	/* GOOD CODE ENDS HERE */

	// TODO: Remove this. This is setup for the audio WAV file.
	Wav wav = wavOpen("./tests/getlucky.wav"); 
	
	// TODO: Replace this next part
	// NOTE(Nate): These are hardcoded values. This is bad, but okay for Week 1.
	effect[0] = (void(*)()) reverb_digi;
	effectCount = 1;
	
	// Port audio API work
	if (Pa_Initialize() != paNoError) {
		return -2;
	}
	int outId = Pa_GetDefaultOutputDevice();
	PaStream* stream;
	if (paNoError != Pa_OpenDefaultStream(&stream, 0, 1, paInt16, wav.sampleRate, paFramesPerBufferUnspecified, NULL /* SLOW. USE CALLBACK */, NULL /* USED FOR PREV STUFF */)) {
		return -3;
	}
	if (paNoError != Pa_StartStream(stream)) {
		return -4;
	}

	// int error = Pa_StartStream( PaStream *stream );
	size_t idx = 0;
	while (1) {
		buffer[idx] = wavNext(&wav);
		// buffer[idx] = getInputAmplitude();
		for (int i = 0; i < effectCount; i++) {
			// TODO: This isn't correct cus it hardcodes the arguments
			effect[i](buffer, sizeof(buffer), idx, 128);
		}
		// Write a single frame
		Pa_WriteStream(stream, &buffer[idx], 1);

		idx++;
		if (idx >= bufferLength) { idx=0; }
	}

	// Will probably never reach here. Should probably have signals which control
	// this
	Pa_StopStream(stream);
	Pa_CloseStream(stream);
	return 0;
}

void initDefaultConfig(SynthConfig* config) {
	config->bufferSize = MiB(500);
	return;
}

UsageStatus parseOptions(int argc, char* argv[], SynthConfig* config) {
	if (argc < 1) {
		puts("Recieved no arguments");
		return CONFIG_INVALID_EXEC_NAME;	
	}

	int opt;
	while ((opt = getopt(argc, argv, "m:")) != -1) {
		switch (opt) {
		case 'b': {
			config->bufferSize = atoi(optarg); // Convert to 
			break;
		}
		}
	}

	return CONFIG_OK;
}

void printUsage() {
	printf(
		"Usage:\n\t%s [-b buffer_size]\n",
		EXEC_NAME
	);
}

s16 getInputAmplitude() {

	// TODO: Read this input from I/O. For now, should probably read this input
	// from a file
	return 0;
}
