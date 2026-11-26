import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit3, Check, X, Image as ImageIcon, CheckCircle2, Circle } from 'lucide-react';

const STORAGE_KEY = 'dessn_todo_demo_items_v1';

// 默认初始示例数据，方便导入画布时立即看到丰富界面
const DEFAULT_TODOS = [
  {
    id: '1',
    text: '完成 Dessn 设计画布交互测试，检查按钮圆角与间距',
    completed: false,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-11-26 10:00'
  },
  {
    id: '2',
    text: '整理下午产品评审会的 UI 改版需求清单',
    completed: true,
    image: null,
    createdAt: '2026-11-26 09:30'
  }
];

export default function App() {
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_TODOS;
    } catch {
      return DEFAULT_TODOS;
    }
  });

  // 添加新任务的状态
  const [newText, setNewText] = useState('');
  const [newImage, setNewImage] = useState(null);
  const newFileInputRef = useRef(null);

  // 编辑现有任务的状态
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editImage, setEditImage] = useState(null);
  const editFileInputRef = useRef(null);

  // 筛选状态：all | active | completed
  const [filter, setFilter] = useState('all');

  // 每次 todos 变化时同步写入 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
      alert('本地存储空间已满（图片过大），请删除部分带图任务后再试。');
    }
  }, [todos]);

  // 将本地上传的图片转换为 Base64 以便存入 localStorage
  const handleImageUpload = (file, setter) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setter(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // 添加任务
  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!newText.trim() && !newImage) return;

    const newItem = {
      id: Date.now().toString(),
      text: newText.trim() || '（无文字图片任务）',
      completed: false,
      image: newImage,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTodos([newItem, ...todos]);
    setNewText('');
    setNewImage(null);
    if (newFileInputRef.current) newFileInputRef.current.value = '';
  };

  // 切换完成状态
  const toggleComplete = (id) => {
    setTodos(todos.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  // 删除任务
  const handleDelete = (id) => {
    setTodos(todos.filter(item => item.id !== id));
    if (editingId === id) setEditingId(null);
  };

  // 进入编辑模式
  const startEditing = (item) => {
    setEditingId(item.id);
    setEditText(item.text);
    setEditImage(item.image);
  };

  // 保存编辑（支持同时修改文字和图片）
  const saveEdit = (id) => {
    if (!editText.trim() && !editImage) return;
    setTodos(todos.map(item =>
      item.id === id
        ? { ...item, text: editText.trim() || '（无文字图片任务）', image: editImage }
        : item
    ));
    setEditingId(null);
    setEditText('');
    setEditImage(null);
  };

  const filteredTodos = todos.filter(item => {
    if (filter === 'active') return !item.completed;
    if (filter === 'completed') return item.completed;
    return true;
  });

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* 头部标题区 */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">图文待办清单</h1>
            <p className="text-sm text-slate-500 mt-1">数据全本地存储 · 支持图文混合添加与修改</p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
            剩余 {todos.filter(t => !t.completed).length} 项待办
          </span>
        </header>

        {/* 添加任务卡片 */}
        <form onSubmit={handleAddTodo} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="输入新的待办事项内容..."
              className="w-full text-base text-slate-800 placeholder-slate-400 focus:outline-none"
            />

            {/* 待添加的图片预览 */}
            {newImage && (
              <div className="relative inline-block w-32 h-32 rounded-xl overflow-hidden border border-slate-200 group">
                <img src={newImage} alt="预览" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setNewImage(null);
                    if (newFileInputRef.current) newFileInputRef.current.value = '';
                  }}
                  className="absolute top-1.5 right-1.5 bg-slate-900/70 text-white p-1 rounded-full hover:bg-red-600 transition"
                  title="移除图片"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <input
                  ref={newFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0], setNewImage)}
                  className="hidden"
                  id="new-todo-image"
                />
                <label
                  htmlFor="new-todo-image"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-slate-50 transition"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>{newImage ? '更换图片' : '添加图片'}</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={!newText.trim() && !newImage}
                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-medium px-4 py-2 rounded-xl transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>添加任务</span>
              </button>
            </div>
          </div>
        </form>

        {/* 状态筛选标签 */}
        <div className="flex items-center gap-2 mb-4">
          {[
            { key: 'all', label: `全部 (${todos.length})` },
            { key: 'active', label: `进行中 (${todos.filter(t => !t.completed).length})` },
            { key: 'completed', label: `已完成 (${todos.filter(t => t.completed).length})` }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                filter === tab.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 任务列表 */}
        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
              当前分类下暂无待办事项
            </div>
          ) : (
            filteredTodos.map((item) => {
              const isEditing = editingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border transition p-4 ${
                    isEditing ? 'border-indigo-400 ring-2 ring-indigo-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isEditing ? (
                    /* 编辑模式：支持修改文字与替换/删除图片 */
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-3 py-2 text-base border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500"
                        autoFocus
                      />

                      {editImage && (
                        <div className="relative inline-block w-36 h-36 rounded-xl overflow-hidden border border-slate-200">
                          <img src={editImage} alt="编辑预览" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setEditImage(null)}
                            className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition"
                            title="删除此图片"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <input
                            ref={editFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e.target.files[0], setEditImage)}
                            className="hidden"
                            id={`edit-img-${item.id}`}
                          />
                          <label
                            htmlFor={`edit-img-${item.id}`}
                            className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg cursor-pointer transition"
                          >
                            <ImageIcon className="w-4 h-4" />
                            <span>{editImage ? '替换为新图片' : '补充上传图片'}</span>
                          </label>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                            <span>取消</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEdit(item.id)}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>保存修改</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* 正常展示模式 */
                    <div className="flex items-start gap-3.5">
                      <button
                        onClick={() => toggleComplete(item.id)}
                        className="mt-0.5 text-slate-400 hover:text-indigo-600 transition cursor-pointer shrink-0"
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-base break-words ${
                            item.completed ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {item.text}
                        </p>

                        {item.image && (
                          <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 max-w-xs bg-slate-50">
                            <img
                              src={item.image}
                              alt="任务配图"
                              className="w-full max-h-48 object-cover"
                            />
                          </div>
                        )}

                        <span className="block text-xs text-slate-400 mt-2">
                          创建于 {item.createdAt}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEditing(item)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                          title="编辑文字或图片"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="删除任务"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}