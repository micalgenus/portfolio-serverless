FROM node:11

COPY  . /usr/local/share/portfolio-serverless
WORKDIR /usr/local/share/portfolio-serverless

RUN apt -y update
RUN apt -y install gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

RUN yarn global add serve
RUN yarn
RUN yarn build

WORKDIR /usr/local/share/portfolio-serverless/docs

EXPOSE 5000

HEALTHCHECK --interval=10s CMD wget -qO- localhost:5000

CMD ["serve"]