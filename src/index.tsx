import {Context, Schema, h} from 'koishi'
import sharp from 'sharp';
import fetch from 'node-fetch';

export const name = 'nrl-meme'

export interface Config {
  api_url: string,
  debug: boolean,
  enable_convert: boolean,
  jpgQuality: number,
}

export const Config: Schema = Schema.intersect([
  Schema.object({
    api_url: Schema.string().description('API地址').default('https://meme.3sqrt7.com/api/image'),
    debug: Schema.boolean().description('是否启动调试模式').default(false),
  }).description('基础配置'),
  Schema.object({
    enable_convert: Schema.boolean().description('是否启用WEBP转JPG再发送（如果遇到奇怪的问题建议开启）').default(false),
  }).description('高级配置'),
  Schema.union([
    Schema.object({
      enable_convert: Schema.const(true).required(),
      jpgQuality: Schema.number().role('slider').min(1).max(100).step(1).description('JPG图像质量（转JPG开启后生效）').default(90),
    }),
    Schema.object({}),
  ])
])

// export const Config: Schema<Config> = Schema.object({
//   enableCovert: Schema.boolean().description('是否启用WEBP转JPG再发送（如果遇到奇怪的问题建议开启）').default(false),
//   jpgQuality: Schema.number().description('JPG图像质量（转JPG开启后生效）').default(90),
// })

export function apply(ctx: Context, config: Config) {
  const logger = ctx.logger('NRL-meme')
  const ifDebug = config.debug
  outputDebug(config);
  const getRandomUrl = () => {
    const defaultUrl = config.api_url
    const randomNum = Math.floor(Math.random() * 100)
    return defaultUrl + '?' + randomNum
  }
  const content_generator = async (time: number) => {
    outputDebug('content_generator启动');
    let divs = [];
    for (let i = 0; i < time; i++) {
      if (config.enable_convert) {
        const response = await fetch(getRandomUrl());
        const webpBuffer = await response.arrayBuffer();
        const jpgBuffer = await sharp(Buffer.from(webpBuffer))
          .jpeg({quality: config.jpgQuality})
          .toBuffer();
        const base64Image = `data:image/jpeg;base64,${jpgBuffer.toString('base64')}`;
        divs.push(<message>
          <author id="3026194904" name="Apricityx" avatar="url"/>
          <img src={base64Image} alt="Image"/></message>);
      } else {
        divs.push(<message>
          <author id="3026194904" name="Apricityx" avatar="url"/>
          <img src={getRandomUrl()} alt={"Image"}/></message>);
      }
    }
    return divs;
  }

  //如果文件夹./meme不存在则创建
  // const botId = config['botId']
  // const avatarPath = "https://q1.qlogo.cn/g?b=qq&nk=" + botId + "&s=100"
  // const memePath = config['meme_path']
  // if (!fs.existsSync(memePath)) {
  //   fs.mkdirSync(memePath)
  // }
  ctx.command('生草').action(async ({session}) => {
    // sendMeme(session)
    outputDebug('草')
    await session.send(<>
      <message>
        {await content_generator(1)}
      </message>
    </>)
  })
  ctx.command('生中草').action(async ({session}) => {
    // sendMeme(session)
    await session.send(<>
      <message forward>
        {await content_generator(5)}
      </message>
    </>)
  })
  ctx.command('生大草').action(async ({session}) => {
    // sendMeme(session)
    await session.send(<>
      <message forward>
        {await content_generator(10)}
      </message>
    </>)
  })
  ctx.command('生巨草').action(async ({session}) => {
    await session.send(<>
      <message forward>
        {await content_generator(20)}
      </message>
    </>)
  })
  ctx.command('生好多草 [arg:number]').action(async ({session}, arg) => {
    if (arg == undefined) {
      await session.send('指令用法：生好多草 [次数]\n例如：生好多草 10')
      return
    }
    if (arg > 50) {
      await session.send('太多了，我生不动了')
      return
    } else {
      let content = '';
      for (let i = 0; i < arg; i++) {
        content += '草'
      }
      await session.send(content)
      await session.send(<>
        <message forward>
          {await content_generator(arg)}
        </message>
      </>)
    }
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

  function outputDebug(text: any) {
    if (ifDebug)
      logger.success(text)
  }
}
