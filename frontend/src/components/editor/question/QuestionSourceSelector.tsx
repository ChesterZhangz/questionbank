import React, { useState, useMemo } from 'react';
import { BookOpen, X, Search } from 'lucide-react';
import Input from '../../ui/Input';
import Card from '../../ui/Card';

interface QuestionSourceSelectorProps {
  source: string;
  onSourceChange: (source: string) => void;
  className?: string;
}

// 预设年份（最近10年）
const getRecentYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => currentYear - i);
};

// 预设地区/学校
const presetRegions = [
  '北京', '上海', '天津', '重庆', '河北', '山西', '辽宁', '吉林', '黑龙江', '江苏',
  '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '海南',
  '四川', '贵州', '云南', '陕西', '甘肃', '青海', '台湾', '内蒙古', '广西', '西藏',
  '宁夏', '新疆', '香港', '澳门'
];

const presetSchools = [
  '北京四中', '人大附中', '清华附中', '北大附中', '北京八中', '北京十一学校',
  '上海中学', '华师大二附中', '复旦附中', '交大附中', '上海实验学校',
  '天津南开中学', '天津一中', '天津耀华中学',
  '重庆巴蜀中学', '重庆南开中学', '重庆一中',
  '河北衡水中学', '石家庄二中', '唐山一中',
  '山西太原五中', '山西实验中学',
  '东北育才学校', '辽宁省实验中学', '大连二十四中',
  '吉林一中', '长春十一中',
  '哈尔滨三中', '大庆实验中学',
  '南京外国语学校', '南师附中', '苏州中学', '无锡一中',
  '杭州二中', '学军中学', '镇海中学', '温州中学',
  '合肥一中', '合肥六中', '芜湖一中',
  '福州一中', '厦门双十中学', '泉州五中',
  '江西师大附中', '南昌二中',
  '山东实验中学', '青岛二中', '烟台一中',
  '郑州外国语学校', '河南省实验中学',
  '武汉二中', '华师一附中', '黄冈中学',
  '长沙雅礼中学', '长郡中学', '湖南师大附中',
  '华南师大附中', '深圳中学', '广州二中',
  '海南中学', '海南华侨中学',
  '成都七中', '成都树德中学', '绵阳中学',
  '贵阳一中', '遵义四中',
  '云南师大附中', '昆明一中',
  '西安交大附中', '西工大附中', '铁一中',
  '兰州一中', '西北师大附中',
  '西宁一中', '青海师大附中',
  '乌鲁木齐一中', '新疆实验中学'
];



// 快速模板
const quickTemplates = [
  // 名校期中考试
  '2024年北京四中高一期中·T1',
  '2024年北京四中高一期中·T2',
  '2024年北京四中高二期中·T1',
  '2024年人大附中高一期中·T1',
  '2024年人大附中高二期中·T1',
  '2024年清华附中高一期中·T1',
  '2024年北大附中高一期中·T1',
  '2024年上海中学高一期中·T1',
  '2024年上海中学高二期中·T1',
  '2024年华师大二附中高一期中·T1',
  '2024年复旦附中高一期中·T1',
  '2024年交大附中高一期中·T1',
  
  // 名校期末考试
  '2024年北京四中高一期末·T1',
  '2024年北京四中高二期末·T1',
  '2024年人大附中高一期末·T1',
  '2024年人大附中高二期末·T1',
  '2024年上海中学高一期末·T1',
  '2024年上海中学高二期末·T1',
  '2024年华师大二附中高一期末·T1',
  '2024年复旦附中高一期末·T1',
  '2024年交大附中高一期末·T1',
  
  // 衡水中学系列
  '2024年衡水中学高一期中·T1',
  '2024年衡水中学高二期中·T1',
  '2024年衡水中学高三期中·T1',
  '2024年衡水中学高一期末·T1',
  '2024年衡水中学高二期末·T1',
  '2024年衡水中学高三期末·T1',
  '2024年衡水中学高三模拟·T1',
  '2024年衡水中学高三模拟·T2',
  
  // 其他名校
  '2024年天津南开中学高一期中·T1',
  '2024年天津南开中学高二期中·T1',
  '2024年重庆巴蜀中学高一期中·T1',
  '2024年重庆南开中学高一期中·T1',
  '2024年南京外国语学校高一期中·T1',
  '2024年南师附中高一期中·T1',
  '2024年苏州中学高一期中·T1',
  '2024年杭州二中高一期中·T1',
  '2024年学军中学高一期中·T1',
  '2024年镇海中学高一期中·T1',
  '2024年温州中学高一期中·T1',
  '2024年合肥一中高一期中·T1',
  '2024年福州一中高一期中·T1',
  '2024年厦门双十中学高一期中·T1',
  '2024年江西师大附中高一期中·T1',
  '2024年山东实验中学高一期中·T1',
  '2024年青岛二中高一期中·T1',
  '2024年郑州外国语学校高一期中·T1',
  '2024年武汉二中高一期中·T1',
  '2024年华师一附中高一期中·T1',
  '2024年黄冈中学高一期中·T1',
  '2024年长沙雅礼中学高一期中·T1',
  '2024年长郡中学高一期中·T1',
  '2024年湖南师大附中高一期中·T1',
  '2024年华南师大附中高一期中·T1',
  '2024年深圳中学高一期中·T1',
  '2024年广州二中高一期中·T1',
  '2024年成都七中高一期中·T1',
  '2024年成都树德中学高一期中·T1',
  '2024年绵阳中学高一期中·T1',
  '2024年西安交大附中高一期中·T1',
  '2024年西工大附中高一期中·T1',
  '2024年铁一中高一期中·T1',
  
  // 月考系列
  '2024年北京四中高一月考·T1',
  '2024年北京四中高二月考·T1',
  '2024年人大附中高一月考·T1',
  '2024年人大附中高二月考·T1',
  '2024年上海中学高一月考·T1',
  '2024年上海中学高二月考·T1',
  '2024年衡水中学高一月考·T1',
  '2024年衡水中学高二月考·T1',
  '2024年衡水中学高三月考·T1',
];

// 解析当前输入，判断处于哪个阶段
const parseInputStage = (input: string) => {
  // 如果输入为空，显示快速模板
  if (!input.trim()) {
    return { stage: 'start', value: '', remaining: '' };
  }
  
  // 匹配年份
  const yearMatch = input.match(/^(\d{1,4})年?/);
  if (yearMatch) {
    const year = yearMatch[1];
    if (year.length < 4) {
      return { stage: 'year', value: year, remaining: input.substring(yearMatch[0].length) };
    }
    const fullYear = yearMatch[0];
    const remaining = input.substring(fullYear.length);
    
    // 检查是否有地区/学校
    const regionMatch = remaining.match(/^(.+?)([^·]+?)(期中|期末|月考|周测|单元测|模拟考|高考|中考|小升初|竞赛|奥赛|数学赛|物理赛|化学赛|自招|强基|综评|保送|考研|公考|教资)/);
    if (regionMatch) {
      const examType = regionMatch[3];
      const finalRemaining = remaining.substring(regionMatch[0].length);
      
      // 检查是否有题号
      const questionMatch = finalRemaining.match(/·T(\d+)/);
      if (questionMatch) {
        return { stage: 'complete', value: input };
      } else {
        return { stage: 'questionNumber', value: examType, remaining: finalRemaining };
      }
    } else {
      return { stage: 'region', value: '', remaining };
    }
  }
  
  // 检查是否以数字开头（年份输入中）
  if (/^\d{1,3}$/.test(input)) {
    return { stage: 'year', value: input, remaining: '' };
  }
  
  // 如果输入了内容但不是数字开头，可能是地区/学校搜索
  return { stage: 'region', value: '', remaining: input };
};

const QuestionSourceSelector: React.FC<QuestionSourceSelectorProps> = ({
  source,
  onSourceChange,
  className = ''
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [customSource, setCustomSource] = useState('');

  // 解析当前输入阶段
  const currentStage = useMemo(() => parseInputStage(customSource), [customSource]);

  const [templateSearchTerm, setTemplateSearchTerm] = useState('');

  // 根据当前阶段生成提示选项
  const getSuggestions = useMemo(() => {
    const { stage, value, remaining } = currentStage;
    
    switch (stage) {
      case 'year':
        if (value.length < 4) {
          // 年份输入中，显示匹配的年份
          return getRecentYears()
            .filter(year => year.toString().startsWith(value))
            .map(year => `${year}年`);
        }
        break;
        
      case 'region':
        // 年份已输入，显示地区/学校选项
        const searchTerm = (remaining || '').trim();
        const allRegions = [...presetRegions, ...presetSchools];
        return allRegions
          .filter(region => region.includes(searchTerm))
          .slice(0, 15); // 限制显示数量
          
      case 'questionNumber':
        // 考试类型已输入，提示题号格式
        return ['·T1', '·T2', '·T3', '·T4', '·T5', '·T6', '·T7', '·T8', '·T9', '·T10', '·T11', '·T12', '·T13', '·T14', '·T15', '·T16', '·T17', '·T18', '·T19', '·T20', '·T21', '·T22', '·T23', '·T24', '·T25', '·T26', '·T27', '·T28', '·T29', '·T30'];
        
      case 'start':
        // 初始状态，显示快速模板（支持搜索）
        if (templateSearchTerm.trim()) {
          return quickTemplates
            .filter(template => 
              template.toLowerCase().includes(templateSearchTerm.toLowerCase())
            )
            .slice(0, 20); // 限制搜索结果数量
        }
        return quickTemplates.slice(0, 20); // 默认显示前20个
        
      default:
        return [];
    }
    
    return [];
  }, [currentStage, templateSearchTerm]);

  const handleSelectSuggestion = (suggestion: string) => {
    const { stage, value } = currentStage;
    let newSource = customSource;
    
    switch (stage) {
      case 'year':
        if (value.length < 4) {
          // 补全年份
          newSource = customSource.replace(/^\d{1,4}年?/, suggestion);
        }
        break;
        
      case 'region':
        // 添加地区/学校
        newSource = customSource + suggestion;
        break;
        
      case 'questionNumber':
        // 添加题号
        newSource = customSource + suggestion;
        break;
        
      default:
        // 直接替换
        newSource = suggestion;
    }
    
    setCustomSource(newSource);
    onSourceChange(newSource);
    setShowDropdown(false);
    setTemplateSearchTerm(''); // 重置模板搜索
  };

  const handleCustomSourceChange = (value: string) => {
    setCustomSource(value);
    onSourceChange(value);
  };

  const handleClear = () => {
    onSourceChange('');
    setCustomSource('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (getSuggestions.length > 0) {
        handleSelectSuggestion(getSuggestions[0]);
      }
    }
  };

  // 获取当前阶段的提示文本
  const getStageHint = () => {
    const { stage } = currentStage;
    switch (stage) {
      case 'year':
        return '请输入年份';
      case 'region':
        return '请选择地区或学校';
      case 'questionNumber':
        return '请输入题号';
      default:
        return '格式：年份+地区/学校+年级+考试性质+题号';
    }
  };

  return (
    <Card className={className}>
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h3 className="font-medium text-gray-900 dark:text-gray-100">题目出处</h3>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {/* 智能输入框 */}
        <div className="relative">
          <Input
            value={customSource}
            onChange={(e) => handleCustomSourceChange(e.target.value)}
            placeholder={getStageHint()}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            onKeyPress={handleKeyPress}
          />
          
          {/* 智能提示下拉框 */}
          {showDropdown && getSuggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg dark:shadow-gray-900/50 max-h-80 overflow-y-auto">
              {/* 阶段提示 */}
              <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-xs font-medium text-blue-700 dark:text-blue-300 border-b border-blue-200 dark:border-blue-700">
                {getStageHint()}
              </div>
              
              {/* 快速模板搜索框 */}
              {currentStage.stage === 'start' && (
                <div className="p-2 border-b border-gray-100 dark:border-gray-600">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-3.5 w-3.5" />
                    <input
                      type="text"
                      value={templateSearchTerm}
                      onChange={(e) => setTemplateSearchTerm(e.target.value)}
                      placeholder="搜索快速模板..."
                      className="w-full pl-7 pr-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}
              
              {/* 建议选项 */}
              <div className="max-h-60 overflow-y-auto">
                {getSuggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion}-${index}`}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none text-gray-700 dark:text-gray-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              
              {/* 快速模板统计信息 */}
              {currentStage.stage === 'start' && (
                <div className="px-3 py-1 bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600">
                  共 {quickTemplates.length} 个模板
                  {templateSearchTerm && `，找到 ${getSuggestions.length} 个匹配项`}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 当前来源显示 */}
        {source && (
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
            <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">{source}</span>
            <button
              onClick={handleClear}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 使用示例 */}
        {!source && (
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>使用示例：</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">2024年</span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">上海中学</span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">高一</span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">期中</span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">·T5</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default QuestionSourceSelector; 