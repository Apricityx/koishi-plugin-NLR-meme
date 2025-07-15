import {Context, Schema, h, Element} from 'koishi'
import sharp from 'sharp';
// import fetch from 'node-fetch';
import axios from 'axios';


export const name = 'nrl-meme'

export interface Config {
  api_url: string,
  debug: boolean,
  enable_concurrent: boolean,
  enable_convert: boolean,
  jpg_quality: number,
  cooldown: number // 新增冷却时间字段，单位秒
}

export const Config: Schema = Schema.intersect([
  Schema.object({
    api_url: Schema.string().description('API地址').default('https://meme.3sqrt7.com/api/image'),
    debug: Schema.boolean().description('是否启动调试模式').default(false),
    cooldown: Schema.number().description('命令冷却时间（秒）').default(0), // 新增配置项
  }).description('基础配置'),
  Schema.object({
    enable_convert: Schema.boolean().description('是否启用WEBP转JPG再发送（如果遇到奇怪的问题建议开启）').default(false),
    enable_concurrent: Schema.boolean().description('是否启用并发来加速图片获取').default(false).experimental()
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
  // 冷却时间记录表
  const cooldownMap = new Map<string, number>()
  // 检查冷却时间，返回剩余秒数（0表示可用）
  function getCooldownRemain(session: any): number {
    const userId = session.userId || session.uid || session.author?.id
    if (!userId) return 0
    const now = Date.now()
    const last = cooldownMap.get(userId) || 0
    const remain = config.cooldown * 1000 - (now - last)
    return remain > 0 ? Math.ceil(remain / 1000) : 0
  }

  const getBase64Image = async () => {
    const webpBuffer = await ctx.http.get(getRandomUrl())
    const jpgBuffer = await sharp(Buffer.from(webpBuffer))
      .jpeg({quality: config.jpg_quality})
      .toBuffer();
    return `data:image/jpeg;base64,${jpgBuffer.toString('base64')}`
  }
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
    if (config.enable_concurrent) {
      // 并发获取图片
      const fetchPromises = [];
      const fetchPromise = async () => {
        const base64Image = await getBase64Image()
        divs.push(
          <message>
            <author id="3026194904" name="Apricityx" avatar="url"/>
            <img src={base64Image} alt="Image"/>
          </message>
        );
      }
      for (let i = 0; i < time; i++) {
        fetchPromises.push(fetchPromise());
      }
      logger.warn("尝试执行所有Promise");
      await Promise.all(fetchPromises);
    } else {
      for (let i = 0; i < time; i++) {
        if (config.enable_convert) {
          // await import('node-fetch').then(async (fetch) => {

          const base64Image = await getBase64Image();
          divs.push(<message>
            <author id="3026194904" name="Apricityx" avatar="url"/>
            <img src={base64Image} alt="Image"/></message>);
        } else {
          divs.push(<message>
            <author id="3026194904" name="Apricityx" avatar="url"/>
            <img src={getRandomUrl()} alt={"Image"}/></message>);
        }
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
    outputDebug('草')
    const remain = getCooldownRemain(session)
    if (remain > 0) {
      await session.send(`冷却中，请${remain}秒后再试。`)
      return
    }
    cooldownMap.set(session.userId || session.uid || session.author?.id, Date.now())
    await session.send(<>
      <message>
        {await content_generator(1)}
      </message>
    </> as Element.Fragment)
  })
  ctx.command('生中草').action(async ({session}) => {
    const remain = getCooldownRemain(session)
    if (remain > 0) {
      await session.send(`冷却中，请${remain}秒后再试。`)
      return
    }
    cooldownMap.set(session.userId || session.uid || session.author?.id, Date.now())
    await session.send(<>
      <message forward>
        {await content_generator(5)}
      </message>
    </>)
  })
  ctx.command('生大草').action(async ({session}) => {
    const remain = getCooldownRemain(session)
    if (remain > 0) {
      await session.send(`冷却中，请${remain}秒后再试。`)
      return
    }
    cooldownMap.set(session.userId || session.uid || session.author?.id, Date.now())
    await session.send(<>
      <message forward>
        {await content_generator(10)}
      </message>
    </>)
  })
  ctx.command('生巨草').action(async ({session}) => {
    const remain = getCooldownRemain(session)
    if (remain > 0) {
      await session.send(`冷却中，请${remain}秒后再试。`)
      return
    }
    cooldownMap.set(session.userId || session.uid || session.author?.id, Date.now())
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
