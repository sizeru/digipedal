CC = gcc
EXEC = synth
SRCS = synth.c effects.c wav.c

synth: ${SRCS}
	${CC} -o ${EXEC} ${SRCS} -Ofast

debug: ${SRCS}
	${CC} -o ${EXEC} ${SRCS} -Og -g3

clean:
	rm -f ${EXEC}