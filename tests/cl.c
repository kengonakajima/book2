#include <stdio.h>
#include <arpa/inet.h> // inet_pton
#include <errno.h> // errno
#include <string.h> // strerror
#include <unistd.h> // read/write
#include <netinet/tcp.h>
#include <sys/select.h> // select
#include <sys/time.h> // gettimeofday
#include <stdlib.h>

void print_tcp_stat(int fd);
    

double now() {
    struct timeval tmv;
    gettimeofday( &tmv, NULL );
    return tmv.tv_sec  + (double)(tmv.tv_usec) / 1000000.0f;
}

int main(int argc, char **argv) {
    int fd=socket(AF_INET,SOCK_STREAM,0);
    struct sockaddr_in addr;
    addr.sin_family=AF_INET;
    addr.sin_port=htons(22222);
    int ret=inet_pton(AF_INET,argv[1],&addr.sin_addr.s_addr);
    if(ret<0) { fprintf(stderr,"inet_pton error:%s\n",strerror(errno)); return 1; }
    ret=connect(fd, (struct sockaddr*)&addr, sizeof(struct sockaddr_in));
    if(ret<0) { fprintf(stderr,"connect error:%s\n",strerror(errno)); return 1; }

    int n=100;
    int cnt=0;
    int long_delay_count=0;
    double total_delay_sec=0;
    int total_recv_count=0;
    double min_delay=999, max_delay=0;
    double last_sent_at=0;
    while(1) {
        usleep(100);
        fd_set rfds,wfds;
        FD_ZERO(&rfds);
        FD_ZERO(&wfds);        
        FD_SET(fd,&rfds);
        FD_SET(fd,&wfds);        
        struct timeval timeout={0,0};
        if(select(fd+1,&rfds,&wfds,0,&timeout)>0) {
            if(FD_ISSET(fd,&wfds)) {
                if(now()>last_sent_at+0.05) {
                    last_sent_at=now();
                    cnt++;
                    if(cnt==n) {
                        fprintf(stderr,"sent %d, long delay:%d avg delay:%f min delay:%f max delay:%f\n",
                                cnt, long_delay_count, total_delay_sec/(double)total_recv_count, min_delay, max_delay );
                        break;
                    }
                    char s[100];
                    sprintf(s,"%f\n",now());
                    int ret=write(fd,s,strlen(s));
                    if(ret<0) fprintf(stderr,"write error:%s\n",strerror(errno));
                }
            }
            if(FD_ISSET(fd,&rfds)) {
                char buf[100];
                int ret=read(fd,buf,sizeof(buf)-1);
                if(ret<=0){
                    fprintf(stderr,"read error, stop\n");
                    break;
                } else {
                    buf[ret]='\0';
                    double sent_at=atof(buf);
                    double dt = now() - sent_at;
                    int is_slow = (dt>0.1);
                    fprintf(stderr, "dt: %f slow:%d\n", dt, is_slow );
                    if(is_slow) long_delay_count++;
                    total_delay_sec += dt;
                    total_recv_count++;
                    if(dt<min_delay)min_delay=dt;
                    if(dt>max_delay)max_delay=dt;
                    print_tcp_stat(fd);
                }
            }
        }
    }
    close(fd);
    return 0;
}





