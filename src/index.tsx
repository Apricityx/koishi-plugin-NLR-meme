import {Context, Schema, h} from 'koishi'
import fetch from 'node-fetch';
import {writeFile} from 'fs';
import * as fs from 'fs';
import {join} from 'path';

export const name = 'nrl-meme'

export interface Config {
}

export const Config: Schema<Config> = Schema.object({
    // meme_path: Schema.string().description('存储路径：').default('./meme'),
    api_url: Schema.string().description('API地址').default('https://meme.3sqrt7.com/api/image'),
    debug: Schema.boolean().description('是否启动调试模式').default(false),
})

export function apply(ctx: Context, config: Config) {
    //如果文件夹./meme不存在则创建
    const botId = config['botId']
    const avatarPath = "https://q1.qlogo.cn/g?b=qq&nk=" + botId + "&s=100"
    // const memePath = config['meme_path']
    // if (!fs.existsSync(memePath)) {
    //   fs.mkdirSync(memePath)
    // }
    const ifDebug = config['debug']
    const logger = ctx.logger('NRL-meme')
    const url = config['api_url']
    ctx.command('生草').action(({session}) => {
        // sendMeme(session)
        deTbug('草')
        session.send(h('img', {src: url}))
    })
    ctx.command('生大草').action(({session}) => {
        deTbug('草草草草草草草草草草草草草草草')
        // sendMeme(session)
        session.send(h('img', {src: url}))
        session.send(h('img', {src: url}))
        session.send(h('img', {src: url}))
        session.send(h('img', {src: url}))
        session.send(h('img', {src: url}))
        // session.send(
        //     <message forward>
        //         <message>
        //             <author id={botId} name=" " avatar={avatarPath}/>
        //             <img src="https://meme.3sqrt7.com/api/image"/>
        //         </message>
        //         <message>
        //             <author id={botId} name=" " avatar={avatarPath}/>
        //             <img src="https://meme.3sqrt7.com/api/image"/>
        //         </message>
        //         <message>
        //             <author id={botId} name=" " avatar={avatarPath}/>
        //             <img src="https://meme.3sqrt7.com/api/image"/>
        //         </message>
        //         <message>
        //             <author id={botId} name=" " avatar={avatarPath}/>
        //             <img src="https://meme.3sqrt7.com/api/image"/>
        //         </message>
        //         <message>
        //             <author id={botId} name=" " avatar={avatarPath}/>
        //             <img src="https://meme.3sqrt7.com/api/image"/>
        //         </message>
        //     </message>
        // )
    })


    // function generateRandomString(length: number): string {
    //   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    //   let result = '';
    //   const charactersLength = characters.length;
    //   for (let i = 0; i < length; i++) {
    //     result += characters.charAt(Math.floor(Math.random() * charactersLength));
    //   }
    //   return result;
    // }
    //
    // async function downloadImage(url: string, outputPath: string): Promise<void> {
    //   const response = await fetch(url);
    //   const buffer = await response.buffer();
    //   writeFile(outputPath, buffer, () => debug('图片下载并保存成功！'));
    // }
    //
    // function sendMeme(session: any) {
    //   const outputPath = './meme/' + generateRandomString(16) + '.png'
    //   downloadImage(url, outputPath).then(() => {
    //     session.send(<img src={outputPath}/>)
    //   })
    // }

    function deTbug(text: any) {
        if (ifDebug)
            logger.success(text)
    }

    // ctx.on('message', (session) => {
    //   if (session.content === '生草合并消息制作') {
    //     debug('生草')
    //     session.send(
    //       <spl>
    //         <img src="https://meme.3sqrt7.com/api/image"/>
    //         <img src="https://meme.3sqrt7.com/api/image"/>
    //         <img src="https://meme.3sqrt7.com/api/image"/>
    //         <img src="https://meme.3sqrt7.com/api/image"/>
    //         <img src="https://meme.3sqrt7.com/api/image"/>
    //         <img src="https://meme.3sqrt7.com/api/image"/>
    //         <img src="https://meme.3sqrt7.com/api/image"/>
    //         <img src="https://meme.3sqrt7.com/api/image"/>
    //       </spl>
    //     )
    //   }
    // })

}
