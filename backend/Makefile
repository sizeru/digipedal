CC = gcc
EXEC = synth
SRCS = synth.c effects.c wav.c libportaudio.a
LIBS = -lrt -lfftw3 -lm -lasound -ljack -pthread


synth: ${SRCS}
	${CC} -o ${EXEC} ${SRCS} -Ofast ${LIBS}

debug: ${SRCS}
	${CC} -o ${EXEC} ${SRCS} fft/fft4g.c -Og -g3 ${LIBS}

clean:
	rm -f ${EXEC}

dep:
	cd portaudio
	./configure
	make
	cp lib/.libs/portaudio.a ../
	cp include/portaudio.h ../