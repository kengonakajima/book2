#include <stdio.h>
#include <arpa/inet.h> // inet_pton
#include <errno.h> // errno
#include <string.h> // strerror
#include <unistd.h> // read/write
#include <netinet/tcp.h>
#include <sys/select.h> // select
#include <stdlib.h>

#include "util.h"

int main(int argc, char **argv) {
    int fd=socket(AF_INET,SOCK_STREAM,0);
    struct sockaddr_in addr;
    addr.sin_family=AF_INET;
    addr.sin_port=htons(22222);
    int ret=inet_pton(AF_INET,argv[1],&addr.sin_addr.s_addr);
    if(ret<0) { fprintf(stderr,"inet_pton error:%s\n",strerror(errno)); return 1; }
    ret=connect(fd, (struct sockaddr*)&addr, sizeof(struct sockaddr_in));
    if(ret<0) { fprintf(stderr,"connect error:%s\n",strerror(errno)); return 1; }

    double interval=0.2;
    int n=100;
    int cnt=0;
    double last_sent_at=0;
    while(1) {
        usleep(100);
        fd_set wfds;
        FD_ZERO(&wfds);        
        FD_SET(fd,&wfds);        
        struct timeval timeout={0,0};
        if(select(fd+1,0,&wfds,0,&timeout)>0) {
            if(FD_ISSET(fd,&wfds)) {
                if(now()>last_sent_at+interval) {
                    fprintf(stderr,"sending %d\n",cnt);
                    last_sent_at=now();
                    cnt++;
                    if(cnt==n) {
                        fprintf(stderr,"done\n");
                        break;
                    }
                    char s[100];
                    sprintf(s,"%f\n",now());
                    int ret=write(fd,s,strlen(s));
                    if(ret<0) fprintf(stderr,"write error:%s\n",strerror(errno));
                }
            }
        }
    }
    close(fd);
    return 0;
}





