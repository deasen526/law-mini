const { sequelize, Category, Product } = require('../models');

const categories = [
  { name: '劳动维权', icon: '⚖️', sortOrder: 1 },
  { name: '租房纠纷', icon: '🏠', sortOrder: 2 },
  { name: '法律文书', icon: '📄', sortOrder: 3 },
  { name: '年度服务', icon: '⭐', sortOrder: 4 },
];

const products = [
  {
    categoryId: 1,
    name: '劳动仲裁全程陪跑',
    subtitle: '被欠薪/被辞退/没签合同？我们一步步带你走完仲裁',
    price: 59900, // 599元（单位：分）
    originalPrice: 129900,
    coverImage: '/static/products/arbitration-guide.png',
    scenario: '干了几个月被辞退，工资还没结清，公司态度强硬……你想起诉但什么都不会，也不想花几万请律师。',
    roiHint: '你可主张的金额通常包括：未结工资 + 未签合同双倍工资差额 + 违法解除赔偿金 + 加班费。大部分劳动者的案件标的额在 8,000 - 50,000 元之间。花 599 元，帮你要回这笔钱。',
    features: [
      '✅ 1对1案情分析，帮你梳理可主张的全部权益',
      '✅ 定制仲裁申请书（不是模板，是根据你案情写的）',
      '✅ 证据收集清单 + 取证指导（告诉你去哪里拿什么材料）',
      '✅ 仲裁全流程分步指导（每一步有人告诉你做什么）',
      '✅ 开庭前30分钟模拟辅导电话',
      '✅ 结案前不终止服务，一直陪到你拿到裁决书',
    ],
    process: [
      { step: 1, title: '提交案情', desc: '你通过小程序填写基本情况' },
      { step: 2, title: '案情分析', desc: '24小时内法律顾问分析你的案件，告诉你可主张什么' },
      { step: 3, title: '定制文书', desc: '我们帮你起草仲裁申请书和证据清单' },
      { step: 4, title: '立案指导', desc: '告诉你去哪里立案、带什么材料、注意什么' },
      { step: 5, title: '开庭辅导', desc: '开庭前电话模拟，让你知道仲裁庭上怎么说话' },
      { step: 6, title: '全程跟进', desc: '每一步都有人问，直到拿到裁决书' },
    ],
    cases: [
      { title: '95后女生小陈', desc: '入职8个月没签合同被辞退，我们帮她梳理了双倍工资差额+违法解除赔偿金共28,000元，全程指导仲裁，2个月拿到钱。', result: '拿回28,000元' },
      { title: '程序员小张', desc: '公司拖欠3个月工资后裁员，我们帮他起草仲裁申请+证据清单，仲裁委全额支持了他的主张。', result: '拿回36,000元' },
      { title: '销售员小李', desc: '试用期被辞退没给补偿，我们认为公司不符合"试用期不合格"的法律要件，陪他走完仲裁，最终调解拿回赔偿。', result: '调解拿回12,000元' },
    ],
    guarantee: '如果仲裁委不受理你的案子，我们全额退款。',
    sortOrder: 1,
  },
  {
    categoryId: 1,
    name: 'AI法律分析报告',
    subtitle: '30分钟了解你的案件值多少钱、该怎么打',
    price: 990, // 9.9元
    originalPrice: 4900,
    coverImage: '/static/products/ai-report.png',
    scenario: '不确定自己的情况能不能维权？想知道大概能拿回多少钱？先别急着行动，让专业分析帮你理清思路。',
    roiHint: '了解你的权益价值，再做决策。',
    features: [
      '✅ 基于你填写的案情，AI + 人工复核生成专属分析报告',
      '✅ 详细列出你可主张的权益清单',
      '✅ 预估可主张金额及计算依据',
      '✅ 给出下一步维权建议',
      '✅ 报告包含具体法条引用（《劳动合同法》第X条）',
    ],
    process: [
      { step: 1, title: '填写情况', desc: '5-10分钟在线填写案情信息' },
      { step: 2, title: 'AI分析', desc: 'AI即时分析，生成初步报告' },
      { step: 3, title: '人工复核', desc: '法律顾问复核关键结论，确保准确' },
      { step: 4, title: '获取报告', desc: '收到完整分析报告，截图可保存' },
    ],
    cases: [],
    guarantee: '报告发出后24小时内可申请退款。',
    sortOrder: 2,
  },
  {
    categoryId: 1,
    name: '律师代理劳动仲裁',
    subtitle: '合作律师直接出庭代理，你安心上班等着拿裁决',
    price: 199900, // 1999元起
    originalPrice: 500000,
    coverImage: '/static/products/lawyer-agent.png',
    scenario: '不想自己面对公司、没时间跑流程、希望专业人士帮你争取最大权益。',
    roiHint: '律师代理通常收费5,000-15,000元，我们通过批量案源压低价格，同时保证专业水准。',
    features: [
      '✅ 合作律所律师直接代理出庭',
      '✅ 律师全程处理：立案、调解、开庭、裁决',
      '✅ 你只需提供材料，其他律师来办',
      '✅ 专业律师操盘，争取最大权益',
      '✅ 如果败诉，全额退还代理费',
    ],
    process: [
      { step: 1, title: '案件评估', desc: '我们先评估你的案子是否适合代理' },
      { step: 2, title: '匹配律师', desc: '匹配擅长你案件类型的合作律师' },
      { step: 3, title: '签订委托', desc: '线上签委托代理协议' },
      { step: 4, title: '律师操盘', desc: '律师全流程代理，你只需要必要时配合' },
    ],
    cases: [],
    guarantee: '仲裁败诉全额退还代理费。',
    sortOrder: 3,
  },
  {
    categoryId: 2,
    name: '租房押金追讨指引',
    subtitle: '房东不退押金？标准催告函+投诉指引',
    price: 1990, // 19.9元
    originalPrice: 9900,
    coverImage: '/static/products/rent-deposit.png',
    scenario: '退租时房东以各种理由扣押金，你不知道怎么要回来。',
    roiHint: '你的押金通常是一个月租金（1,000-3,000元），花19.9元学正确方式追讨。',
    features: [
      '✅ 标准法律催告函（填好你的信息直接用）',
      '✅ 12315消费投诉模板',
      '✅ 住建委投诉渠道和投诉信模板',
      '✅ 小额诉讼起诉指引（诉讼费只要几十块）',
      '✅ 常见房东扣款理由的法律分析（哪些该你赔，哪些不该）',
    ],
    process: [
      { step: 1, title: '获取工具包', desc: '购买后立即获取全部模板和指引' },
      { step: 2, title: '发催告函', desc: '先用标准催告函正式通知房东退款' },
      { step: 3, title: '逐级投诉', desc: '如果房东不理，按指引逐级投诉' },
      { step: 4, title: '小额诉讼', desc: '最后手段：自己去法院小额诉讼（我们提供完整指引）' },
    ],
    cases: [],
    guarantee: '7天内未使用可申请退款。',
    sortOrder: 1,
  },
  {
    categoryId: 3,
    name: '律师函代发',
    subtitle: '专业律师函，让对方知道你是认真的',
    price: 29900, // 299元
    originalPrice: 79900,
    coverImage: '/static/products/lawyer-letter.png',
    scenario: '需要正式的法律文书震慑对方、表明你的严肃立场。律师函是最低成本的法律威慑手段。',
    roiHint: '很多纠纷收到一封律师函就和解了，花299元可能省下一次诉讼。',
    features: [
      '✅ 合作律所出具正式律师函',
      '✅ 律师签字+律所盖章',
      '✅ 快递邮寄给对方',
      '✅ 提供快递单号供你追踪',
    ],
    process: [
      { step: 1, title: '描述情况', desc: '告诉我们纠纷原委和你的诉求' },
      { step: 2, title: '律师起草', desc: '合作律师起草律师函' },
      { step: 3, title: '你确认内容', desc: '发给你确认内容无误' },
      { step: 4, title: '寄出', desc: '律师签字盖章后快递寄出' },
    ],
    cases: [],
    guarantee: '发出前可取消退款。',
    sortOrder: 2,
  },
  {
    categoryId: 4,
    name: '年度法律顾问',
    subtitle: '一年内无限次法律咨询，你的私人法律助手',
    price: 9900, // 99元/年
    originalPrice: 29900,
    coverImage: '/static/products/yearly-plan.png',
    scenario: '你的法律问题不是一次性的——换工作、租房、消费维权……一年总会遇到几次。有个法律助手才安心。',
    roiHint: '一年内遇到任何法律问题都可以随时咨询，平均一天不到3毛钱。',
    features: [
      '✅ 一年内无限次在线法律咨询',
      '✅ 每月1次电话深度咨询（15分钟）',
      '✅ 专属法律知识推送',
      '✅ 购买其他产品享9折会员价',
      '✅ 劳动/租房/消费/婚姻/交通类法律问题全涵盖',
    ],
    process: [
      { step: 1, title: '开通会员', desc: '付费后立即生效' },
      { step: 2, title: '加专属顾问', desc: '系统为你分配专属法律顾问微信' },
      { step: 3, title: '随时咨询', desc: '有问题随时在微信上问，工作日2小时内回复' },
    ],
    cases: [],
    guarantee: '7天内未使用可申请退款。',
    sortOrder: 1,
  },
];

async function seed() {
  try {
    // 同步数据库
    await sequelize.sync({ alter: true });
    console.log('✅ 数据库已同步');

    // 插入分类
    const catCount = await Category.count();
    if (catCount === 0) {
      await Category.bulkCreate(categories);
      console.log('✅ 分类数据已插入');
    } else {
      console.log('⏭️  分类数据已存在，跳过');
    }

    // 插入产品
    const prodCount = await Product.count();
    if (prodCount === 0) {
      // 重新获取分类ID（因为上面刚插入的）
      const cats = await Category.findAll();
      const catMap = {};
      cats.forEach(c => { catMap[c.name] = c.id; });

      const productsWithCatId = products.map(p => ({
        ...p,
        categoryId: catMap[Object.keys(catMap).find(k => {
          // 用名字匹配
          const catMapReverse = {
            '劳动维权': 1, '租房纠纷': 2, '法律文书': 3, '年度服务': 4
          };
          const idx = Object.values(catMapReverse).indexOf(p.categoryId);
          return catMapReverse[Object.keys(catMapReverse)[idx]] === p.categoryId;
        }) ? k : null] || cats.find(c => c.id === p.categoryId)?.id || 1,
      }));

      // 简化：直接用数据库中的实际分类ID
      const fixedProducts = products.map(p => {
        const productCatIndex = p.categoryId - 1; // categoryId 1-4 对应数组 0-3
        return { ...p, categoryId: cats[productCatIndex]?.id || cats[0].id };
      });

      await Product.bulkCreate(fixedProducts);
      console.log(`✅ ${fixedProducts.length} 个产品数据已插入`);
    } else {
      console.log('⏭️  产品数据已存在，跳过');
    }

    console.log('✅ 种子数据初始化完成');
    process.exit(0);
  } catch (err) {
    console.error('❌ 种子数据初始化失败:', err);
    process.exit(1);
  }
}

seed();
