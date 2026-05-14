export interface MediaItem {
  name: string
  path: string
  type: 'image' | 'video'
}

export interface ImageItem extends MediaItem {
  type: 'image'
}

export interface VideoItem extends MediaItem {
  type: 'video'
}

export interface FolderItem {
  name: string
  path: string
  images: ImageItem[]
  videos: VideoItem[]
  media: MediaItem[]
  subfolders?: FolderItem[]
  isMounted?: boolean
}

export interface ProjectItem {
  id: string
  name: string
  folders: FolderItem[]
  isMounted?: boolean
}

const createFolder = (name: string, path: string, imageNames: string[], videoNames: string[] = []): FolderItem => {
  const images: ImageItem[] = imageNames.map(name => ({
    name,
    path: `${path}/${name}`,
    type: 'image'
  }))
  
  const videos: VideoItem[] = videoNames.map(name => ({
    name,
    path: `${path}/${name}`,
    type: 'video'
  }))
  
  const media: MediaItem[] = [...images, ...videos]
  
  return { name, path, images, videos, media }
}

export const projects: ProjectItem[] = [
  {
    id: 'Project1-Image2案例集',
    name: 'AI设计作品集',
    folders: [
      createFolder('AI内衣套装提案', 'Project1-Image2案例集/AI内衣套装提案', [
        'HHsoVUKWcAELHpS.jpg',
        'HHsodhTWgAcbMCA.jpg',
        'HHsoiL_XkAQnI5W.jpg',
        'HHsojELWEAAxyql.jpg'
      ]),
      createFolder('信息卡片 x 底子好 x 兼容各种需求', 'Project1-Image2案例集/信息卡片 x 底子好 x 兼容各种需求', [
        'HHg14jGbcAAuQFH.jpg',
        'HHg1Rf6aMAAW_nZ.jpg',
        'HHg1W70aoAA4un4.jpg',
        'HHg1ZcXaAAAeqbQ.jpg',
        'HHg1sR5a0AMJmIY.jpg',
        'HHg1waSawAAZA24.jpg',
        'HHg28yIagAAThQ6.jpg',
        'HHg2NuJbUAAl6v0.jpg',
        'HHg3FEua0AAaMYO.jpg',
        'HHg3NJhbgAA3nXc.jpg',
        'HHg3WDXaMAAZFKx.jpg',
        'HHg3ctxbMAAKLX1.jpg',
        'HHg4MiXaMAEFL5u.jpg',
        'HHg4PuTa0AAL-q7.jpg',
        'HHg4SdrbQAAq6A0.jpg',
        'HHg4XlcbIAAmtcc.jpg',
        'HHg4eoVbMAAbuk_.jpg',
        'HHg5YC7aoAAVvn3.jpg',
        'HHheUIFa8AAxp2v.jpg',
        'HHhkEdNaUAEMOdD.jpg',
        'HHhsgnxaEAA5TTg.jpg'
      ]),
      createFolder('包装设计', 'Project1-Image2案例集/包装设计', [
        'HG-gIAra0AEn7iL.jpg',
        'HG5wlOJboAEfkLd.jpg',
        'HHrl-o2b0AAON9Y.jpg',
        'HHrl8I5awAAaBoZ.jpg',
        'HHrmCfRbMAAO-2z.jpg',
        'HHrmEzObAAAlJV4.jpg',
        'a822a0eec1c74b1a87d8d618de9952cc.png'
      ]),
      createFolder('汉字logo x 字体艺术 x 字体重构 x 略懂略懂', 'Project1-Image2案例集/汉字logo x 字体艺术 x 字体重构 x 略懂略懂', [
        '1dafdf00-ff8a-4d9e-95fd-8e2511fcdd2d.png',
        '2848c6fe-6210-4e4b-84b9-76fb06756196.png',
        '6a00eb3a-7b4c-4fc0-8a2f-ebeeaacf3b64.png',
        '7b2fa99a-1a27-4a91-bc44-524fb9a788ed.png',
        'HHj5s67bwAAax1J.jpg',
        'HHjyNxHaUAA3qSA.jpg',
        'HHjyQ4vbIAAZWsU.jpg',
        'HHjyUj2a0AA4Mkh.jpg',
        'HHjyXfpbYAAEY1y.jpg',
        'HHjyjRNaIAALmW4.jpg',
        'HHkEQavaEAE159t.jpg',
        'HHkHFAaaQAELEQI.jpg',
        'HHkHFAbbIAAJO1i.jpg',
        'HHkHFAdaAAASCRt.jpg',
        'HHkHFD3boAAUnBk.jpg',
        'cfaa76f6-2380-433f-afb6-8dc38163f9ca.png',
        'feca122f-090d-4761-9f14-7d6916fdc565.png'
      ]),
      createFolder('汉字意象徽记', 'Project1-Image2案例集/汉字意象徽记', [
        'HHiufb3XQAEKvDT.jpg',
        'HHiugR5WEAgxUSq.jpg',
        'HHiuhZYXAAU-Kkd.jpg',
        'HHiuiJTWEAIhchP.jpg'
      ]),
      createFolder('看图学单词手账', 'Project1-Image2案例集/看图学单词手账', [
        'HHpC1qSW4AUfhDM.jpg',
        'HHpC29eWsAAAJ4Z.jpg',
        'HHpC44LW4AQSqsB.jpg',
        'HHpC7FkWYAUdcnF.jpg',
        'HHpKKVPbcAERjNz.jpg'
      ]),
      createFolder('破屏穿越风', 'Project1-Image2案例集/破屏穿越风', [
        'HHo6IPSbMAEtZLY.jpg',
        'HHp0hm4bMAA9RWj.jpg',
        'HHqpZykaYAA5h36.jpg',
        'HHrR9wMaQAAPHzw.jpg',
        'HHrmYvmbkAAaogb.jpg'
      ]),
      createFolder('科普教学和知识卡片', 'Project1-Image2案例集/科普教学和知识卡片', [
        'HHd-uoIbkAArRdm.jpg',
        'HHd_6yEawAAL4gL.jpg',
        'HHeA6p8b0AACJRC.jpg',
        'HHeAFSdbsAAsO38.jpg',
        'HHeAMilaQAEyCO3.jpg',
        'HHeBNJjbkAANCHR (1).jpg',
        'HHeBNJjbkAANCHR.jpg'
      ]),
      createFolder('趣味图形标志', 'Project1-Image2案例集/趣味图形标志', [
        'HHjLOzDXwAERFz_.jpg',
        'HHjLPp2W0AAUfv7.jpg',
        'HHjLQccXQAEwYzO.jpg'
      ]),
      createFolder('AI发型美学升级报告', 'Project1-Image2案例集/AI发型美学升级报告', [
        'HG6R7R5acAATobd.jpg',
        'HG6R8NRaQAAjPJt (1).jpg',
        'HG6R8NRaQAAjPJt.jpg',
        'HG6R9dvX0AAlXZj.jpg'
      ]),
      createFolder('AI美甲灵感方案', 'Project1-Image2案例集/AI美甲灵感方案', [
        'HHj4Vz1WgAIyfLQ.jpg',
        'HHj4YwEWMAQQV8y.jpg',
        'HHj4aMjXgAQxX9D.jpg',
        'HHj7MDEWsAgscEK.jpg',
        'HHk_zqYa0AAi2XL.jpg'
      ]),
      createFolder('AI衣品升级改造报告', 'Project1-Image2案例集/AI衣品升级改造报告', [
        'HG4lEc6aYAAC4Iv.jpg',
        'HG4lEcnasAASf2-.jpg'
      ]),
      createFolder('个人色彩诊断报告', 'Project1-Image2案例集/个人色彩诊断报告', [
        'HG-qDy6WcAABHzX.jpg',
        'HG-qFt8XoAAVXzl.jpg',
        'HG-qH7GbMAA0QRi.jpg'
      ]),
      createFolder('信息图 x 万物简史', 'Project1-Image2案例集/信息图 x 万物简史', [
        'HG51xtoaMAA1Ty8.jpg',
        'HG54S7waYAAc0uh.jpg',
        'HG5jIe5bUAAbIp7.jpg',
        'HG5jMwRaMAAe4lO.jpg',
        'HG5jQpRbUAAk4cu.jpg',
        'HG5ld1RbYAAJWeC.jpg',
        'HG5lhQNb0AA8V3z.jpg',
        'HG5lpPebIAATdN8.jpg',
        'HG5scwKboAArilT.jpg',
        'HG5se8pawAAF-dK.jpg',
        'HG5wPi0aYAAqUHi.jpg',
        'HG5wPi1aoAA0kl2.jpg',
        'HG5xvpVbAAAKOC7.jpg',
        'HG5zxF-aMAAxyMn.jpg',
        'HG6fhcMawAAmgkJ.jpg',
        'HG6rloKaUAAReY4.jpg'
      ]),
      createFolder('六道轮回', 'Project1-Image2案例集/六道轮回', [
        'HHYNM4Da8AAQNq6.jpg',
        'HHYNM4HbEAAQOAl.jpg',
        'HHYNM4RagAALDN5.jpg',
        'HHYNM4gbMAAZDov.jpg'
      ]),
      createFolder('剖面科普图解绘本', 'Project1-Image2案例集/剖面科普图解绘本', [
        'HG_tI2ZakAAk_8F.jpg',
        'HG_tMZmbAAAC9r0.jpg',
        'HG_tQ-VboAAdz_o.jpg',
        'HG_tT-saAAA0PYZ.jpg',
        'HHCSb0QbkAAQ6dQ.jpg'
      ]),
      createFolder('博物馆风格', 'Project1-Image2案例集/博物馆风格', [
        'HG-LMY1agAAMDm4.jpg',
        'HG-UQA6bAAArB5k.jpg',
        'HGg9cUvaEAAhcVG.jpg',
        'HGgwoDGacAAcUP_.jpg',
        'HGgwoDGbEAAYA2_.jpg',
        'HGgwoDLbsAAzkrI.jpg',
        'HGhcjHraYAAyINj.jpg'
      ]),
      createFolder('四季潮牌穿搭指南', 'Project1-Image2案例集/四季潮牌穿搭指南', [
        'HHDeq7TakAAPtxY.jpg',
        'HHDes90bIAAIeOs.jpg',
        'HHDevTbb0AA0Efd.jpg',
        'HHDexSHaYAAvu0T.jpg',
        'HHEz7OtasAEtdce.jpg'
      ]),
      createFolder('四季潮牌穿搭指南》男生版', 'Project1-Image2案例集/四季潮牌穿搭指南》男生版', [
        'HHDlGvsbkAABLC7.jpg',
        'HHDlOmnaoAABoCx.jpg',
        'HHDlZOlbwAA6GCD.jpg',
        'HHDlZSPbcAAe-bq.jpg'
      ]),
      createFolder('国宝生成穿搭灵感方案', 'Project1-Image2案例集/国宝生成穿搭灵感方案', [
        'HHn3I_UWcAQvWwR.jpg',
        'HHn3KhLWMAMOqUj.jpg',
        'HHn3MiPXgAEA9iB.jpg',
        'HHn3N_2XMAITQ9G.jpg',
        'HHqeYVGbgAARubs.jpg',
        'HHrl9GlacAAkRir.jpg'
      ]),
      createFolder('国风美食徽记', 'Project1-Image2案例集/国风美食徽记', [
        'HIF0E3mXgAAgYmJ.jpg',
        'HIF0E3nXQAE045r.jpg',
        'HIF0E3oXQAAp8e_.jpg',
        'HIF0E3sWgAAnmst.jpg'
      ]),
      createFolder('天气预报 x 历史上的今天 x 每日日签', 'Project1-Image2案例集/天气预报 x 历史上的今天 x 每日日签', [
        'HHFe2zNbwAA1QBR.jpg',
        'HHFe447a0AATkzq.jpg',
        'HHFe7GHbcAEk4Bz.jpg'
      ]),
      createFolder('徒步路线图', 'Project1-Image2案例集/徒步路线图', [
        'HHEAFtyXsAAH6Wp.jpg',
        'HHEAFuQaAAA0NDt.jpg',
        'HHEAFuRawAAScXH.jpg',
        'HHEAFuhaQAEaNSc.jpg',
        'HHEGYCKaMAAixvU.jpg'
      ]),
      createFolder('明制汉服图鉴', 'Project1-Image2案例集/明制汉服图鉴', [
        'HH8TTLPaUAAWDJu.jpg',
        'HH8TTLRaYAAz9-D.jpg',
        'HH8TTLSaQAEAsC6.jpg',
        'HH8TTM1bcAEq7CQ.jpg'
      ]),
      createFolder('植物图鉴 x 中药图鉴 x 信息海报', 'Project1-Image2案例集/植物图鉴 x 中药图鉴 x 信息海报', [
        'HHZC0bla4AAi3UM.jpg',
        'HHZC2eObsAACEO5.jpg',
        'HHZCrEibUAAWC2t.jpg',
        'HHZCtMua8AAesut.jpg',
        'HHZCvGkbQAAe9tx.jpg',
        'HHZCwxnaoAABnUz.jpg',
        'HHZCyl4b0AAhYFe.jpg',
        'HHZVjcgbAAAcshB.jpg',
        'HHZYGOpaQAAuwct.jpg',
        'HHZdQQrbcAAMMn-.jpg',
        'HHb4rIoaUAAd9mm.jpg',
        'HHdUYuPbAAA4vh6.jpg'
      ]),
      createFolder('眼镜风格适配报告', 'Project1-Image2案例集/眼镜风格适配报告', [
        'HG_DWhka0AAMJ9b.jpg',
        'HG_De7cakAAq4pm.jpg'
      ]),
      createFolder('线条 x 城市 x  高级收藏感 x 人民币般美感', 'Project1-Image2案例集/线条 x 城市 x  高级收藏感 x 人民币般美感', [
        'HIB-OHsbAAAX-U1.jpg',
        'HIB-Wz9bQAAxnaD.jpg',
        'HIB-gvmaQAAHSrB.jpg',
        'HIB8bhPboAAgiP3.jpg',
        'HIClGPfaoAACMhy.jpg',
        'HIClGRJaIAABShX.jpg',
        'HICxUSWa8AA_FaC.jpg',
        'HICxUfbagAA0GND.jpg'
      ]),
      createFolder('绿植爱好者狂喜 x 花草识别', 'Project1-Image2案例集/绿植爱好者狂喜 x 花草识别', [
        'HHzQ6JZbYAIq0Hi.jpg',
        'HHzQj9SagAI_6Hy.jpg',
        'HHzQmzfb0AAlzWi.jpg',
        'HHzQpJubcAASzmG.jpg',
        'HHzTMhDaEAAa0QM.jpg'
      ]),
      createFolder('都市镂空剪纸', 'Project1-Image2案例集/都市镂空剪纸', [
        'HHwiVCgbUAA30At.jpg',
        'HHwiX51bMAAW6yt.jpg',
        'HHwiaaCa0AAdKho.jpg',
        'HHxED6tboAAuXaP.jpg',
        'NoteGPT_Image_20260508185845.png',
        'ggzhoush.jpg'
      ])
    ]
  },
  {
    id: 'Project2-Mechnism案例集',
    name: '榫卯结构动图',
    folders: [
      createFolder('卯榫结构动图', 'Project2-Mechnism案例集/卯榫结构动图', [
        '1-楔钉榫.gif',
        '2-挖烟袋锅榫.gif',
        '3夹头榫（腿足上端嵌夹牙条与牙头）.gif',
        '4-扇形插肩榫.gif',
        '5-云型插肩榫（牙条牙头分造）.gif',
        '6-传统粽角榫.gif',
        '7-双榫粽角榫.gif',
        '8-带板粽角榫.gif',
        '9-高束腰抱肩榫.gif',
        '10-挂肩四面平榫.gif',
        '11-圆柱丁字结合平榫.gif',
        '12-圆方结合裹腿.gif',
        '13-圆柱二维直角交叉榫.gif',
        '14-圆香几攒边打槽.gif',
        '15-攒边打槽装板.gif',
        '16-一腿三牙方桌结构.gif',
        '17-抄手榫.gif',
        '18-方材角结合床围子攒接万字.gif',
        '19-方形家具腿足与方托泥结合.gif',
        '20-三根直材交叉.gif',
        '21-加云子无束腰裹腿杌凳腿足与凳面结合.gif',
        '22-插肩榫变形.gif',
        '23-平板明榫结合.gif',
        '24-柜子底枨.gif',
        '25-方材丁字结合（榫卯大进小出）.gif',
        '26-厚板闷榫结合.gif',
        '27-厚板出透榫及榫舌抹头.gif',
        '28-椅盘边抹与椅子腿足的结构.gif',
        '29-直材交叉结合.gif',
        '30-弧形直材十字交叉.gif',
        '31-弧形面直材角结合.gif',
        '32-走马销.gif',
        '33-方材丁字形结合榫卯用大格肩.gif'
      ])
    ]
  },
  {
    id: 'Project3-AI生产集',
    name: 'AI视频作品集',
    folders: [
      createFolder('PGAI', 'Project3-AI生产集/PGAI', [
        'ButtyGirlAI_1.png',
        'ButtyGirlAI_2.png',
        'ButtyGirlAI_3.png',
        'ButtyGirlAI_4.png',
        'ButtyGirlAI_5.png',
        'ButtyGirlAI_6.png',
        'ButtyGirlAI_7.png',
        'ButtyGirlAI_8.png',
        'ButtyGirlAI_9.png',
        'ButtyGirlAI_10.png',
        'ButtyGirlAI_11.png',
        'ButtyGirlAI_12.png',
        'ButtyGirlAI_13.png',
        'ButtyGirlAI_14.png',
        'ButtyGirlAI_15.png',
        'ButtyGirlAI_16.png',
        'ButtyGirlAI_17.png',
        'ButtyGirlAI_18.png',
        'ButtyGirlAI_19.png',
        'ButtyGirlAI_20.png',
        'ButtyGirlAI_21.png',
        'ButtyGirlAI_22.png',
        'ButtyGirlAI_23.png',
        'ButtyGirlAI_24.png',
        'ButtyGirlAI_25.png',
        'ButtyGirlAI_26.png',
        'ButtyGirlAI_27.png',
        'ButtyGirlAI_28.png'
      ], ['三峡瀑布.mp4']),
      createFolder('butterfly', 'Project3-AI生产集/butterfly', [
        'bfAI_1.png',
        'bfAI_2.png',
        'bfAI_3.png',
        'bfAI_4.png',
        'bfAI_5.png',
        'bfAI_6.png',
        'bfAI_7.png',
        'bfAI_8.png',
        'bfAI_9.png',
        'bfAI_10.png',
        'bfAI_11.png',
        'bfAI_12.png',
        'bfAI_13.png',
        'bfAI_14.png',
        'bfAI_15.png',
        'bfAI_16.png',
        'bfAI_17.png',
        'bfAI_18.png',
        'bfAI_19.png',
        'bfAI_20.png',
        'bfAI_21.png',
        'bfAI_22.png',
        'bfAI_23.png',
        'bfAI_24.png',
        'bfAI_25.png',
        'bfAI_26.png',
        'bfAI_27.png'
      ])
    ]
  }
]

export const AUTHORIZATION_CODE = 'design2026'