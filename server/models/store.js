/**
 * 纯 JSON 文件数据库
 * 零依赖，无需安装任何数据库
 * 支持基本的 CRUD + 查询 + 排序 + 分页
 */
const fs = require('fs');
const path = require('path');
const { Op } = require('./ops');

const DATA_DIR = path.join(__dirname, '..', 'data');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Store {
  constructor(name) {
    this.name = name;
    this.file = path.join(DATA_DIR, `${name}.json`);
    this.data = [];
    this.idCounter = 1;
    this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.file)) {
        const raw = fs.readFileSync(this.file, 'utf-8');
        this.data = JSON.parse(raw);
        // 找到最大 ID
        this.idCounter = this.data.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
      }
    } catch (e) {
      this.data = [];
    }
  }

  _save() {
    fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  // 生成自增 ID
  _nextId() {
    return this.idCounter++;
  }

  // 创建
  create(item) {
    const record = {
      ...item,
      id: this._nextId(),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
    };
    this.data.push(record);
    this._save();
    return record;
  }

  // 批量创建
  bulkCreate(items) {
    const records = items.map(item => ({
      ...item,
      id: this._nextId(),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
    }));
    this.data.push(...records);
    this._save();
    return records;
  }

  // 按 ID 查找
  findById(id) {
    return this.data.find(item => item.id === id) || null;
  }

  // 条件查询
  findOne(where) {
    return this.data.find(item => this._match(item, where)) || null;
  }

  // 查找所有匹配
  findAll({ where = {}, order = [], limit, offset, include = [] } = {}) {
    let results = this.data.filter(item => this._match(item, where));

    // 排序
    if (order.length > 0) {
      const [field, dir] = order[0];
      results.sort((a, b) => {
        const va = a[field] ?? 0, vb = b[field] ?? 0;
        return dir === 'DESC' ? (vb > va ? 1 : -1) : (va > vb ? 1 : -1);
      });
    }

    const total = results.length;

    // 分页
    if (offset !== undefined) {
      results = results.slice(offset);
    }
    if (limit !== undefined) {
      results = results.slice(0, limit);
    }

    // 处理关联（eager loading）
    if (include.length > 0) {
      results = results.map(item => {
        const obj = { ...item };
        for (const inc of include) {
          if (inc.as && inc.foreignKey) {
            const relatedStore = getStore(inc.modelName || inc.as);
            if (relatedStore) {
              const related = relatedStore.findAll({
                where: { [inc.foreignKey]: item.id }
              });
              // findAll 返回 { rows, count }，取 rows 作为关联数据
              obj[inc.as] = related.rows;
            }
          }
        }
        return obj;
      });
    }

    return { rows: results, count: total };
  }

  // 更新
  update(id, updates) {
    const idx = this.data.findIndex(item => item.id === id);
    if (idx === -1) return null;
    this.data[idx] = {
      ...this.data[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this._save();
    return this.data[idx];
  }

  // 条件更新（返回更新数量）
  updateWhere(where, updates) {
    let count = 0;
    this.data = this.data.map(item => {
      if (this._match(item, where)) {
        count++;
        return { ...item, ...updates, updatedAt: new Date().toISOString() };
      }
      return item;
    });
    if (count > 0) this._save();
    return count;
  }

  // 软删除（标记 isActive = false）
  softDelete(id) {
    return this.update(id, { isActive: false });
  }

  // 计数
  count(where = {}) {
    return this.data.filter(item => this._match(item, where)).length;
  }

  // 求和
  sum(field, where = {}) {
    return this.data
      .filter(item => this._match(item, where))
      .reduce((acc, item) => acc + (parseFloat(item[field]) || 0), 0);
  }

  // 条件匹配
  _match(item, where) {
    if (!where || Object.keys(where).length === 0) return true;

    for (const [key, value] of Object.entries(where)) {
      // 跳过关联嵌套条件（如 'category.id'），在 findAll 中另外处理
      if (key.includes('.')) continue;

      // 顶级 Op.or：{ $or: [cond1, cond2, ...] }
      if (key === Op.or) {
        if (!value.some(cond => this._match(item, cond))) return false;
        continue;
      }

      // 操作符条件：{ fieldName: { $gte: value, $lte: value, ... } }
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        for (const [op, opVal] of Object.entries(value)) {
          if (op === Op.gte) {
            if (new Date(item[key]) < new Date(opVal)) return false;
          } else if (op === Op.lte) {
            if (new Date(item[key]) > new Date(opVal)) return false;
          } else if (op === Op.like) {
            const pattern = opVal.replace(/%/g, '');
            if (!String(item[key] || '').includes(pattern)) return false;
          } else if (op === Op.in) {
            if (!opVal.includes(item[key])) return false;
          } else if (op === Op.ne) {
            if (item[key] === opVal) return false;
          }
        }
      } else if (item[key] !== value) {
        // 精确匹配
        return false;
      }
    }

    return true;
  }

  // 获取原始数据（用于调试）
  all() {
    return this.data;
  }
}

// 导出 Op 供外部使用
module.exports.Op = Op;

// Store 实例缓存
const stores = {};

function getStore(name) {
  if (!stores[name]) {
    stores[name] = new Store(name);
  }
  return stores[name];
}

module.exports.getStore = getStore;
module.exports.Store = Store;
