/**
 * 配置区域
 */
const config = {
    // 假设你有 4 个文件夹，分别存放不同模型的音频
    folders: ["mmaudio", "mmaudioT5", "makeanaudio2", "keling"],
    // 同样的文本，在四个文件夹里的文件名是一样的
    fileNames: [
            { file: "firewood_breaking_burning.wav", text: "柴火噼啪燃烧声" },
            { file: "thunder_rain_heavy.wav", text: "打雷下雨的轰隆声" },
            { file: "leaves_rustling_breeze.wav", text: "微风吹拂树叶的沙沙声" },
            { file: "forest_birds_dawn.wav", text: "清晨森林里鸟语花香" },
            { file: "cafe_cups_clinking.wav", text: "咖啡馆杯子盘子碰撞的声音" },
            { file: "summer_night_crickets_frogs.wav", text: "夏夜野外环境音，有蟋蟀和青蛙叫的声音" },
            { file: "station_announcement_chime.wav", text: "地铁到站的提示音" },
            { file: "old_clock_ticking.wav", text: "老式钟表滴答声" },
            { file: "game_item_pickup.wav", text: "游戏里拾取道具的音效" },
            { file: "scifi_laser_beam.wav", text: "科幻感激光发射声" },
            { file: "rapid_footsteps_pursuit.wav", text: "紧张追逐的急促脚步声" },
            { file: "sword_whoosh_air.wav", text: "御剑飞行的破空呼啸声" },
            { file: "sirens_approaching_echo.wav", text: "渐渐靠近的救护车鸣笛声" },
            { file: "fighter_jet_flyover.wav", text: "一架战斗机从头顶高速飞过的轰鸣声" },
            { file: "balloon_inflate_pop.wav", text: "一个气球被吹起来然后突然爆炸" },
            { file: "underwater_ambience.wav", text: "一段环境音，模拟水下的声学效果" },
            { file: "monks_chanting_temple.wav", text: "寺庙里诵经的声音" },
            { file: "audience_applause.wav", text: "综艺感观众喝彩声" },
            { file: "glass_shattering.wav", text: "玻璃杯掉到水泥地上摔碎的声音" },
            { file: "marble_rolling_wood.wav", text: "一颗弹珠在空旷的木质地板上快速滚动" },
            { file: "crowd_cheering_roaring.wav", text: "人群集体欢呼声，带有夸张的尖叫、鼓掌和口哨声" }
        ]
};

const container = document.getElementById('questions-container');

/**
 * 洗牌算法：打乱数组顺序
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 评分下拉模板 (20-100)
const createOptions = () => `
    <option value="">选择...</option>
    <option value="100">100 (极好 / 完全一致)</option>
    <option value="80">80 (良好 / 基本一致)</option>
    <option value="60">60 (一般 / 部分一致)</option>
    <option value="40">40 (较差 / 不太一致)</option>
    <option value="20">20 (极差 / 完全不符)</option>
`;

/**
 * 渲染测评界面
 */
config.fileNames.forEach((item, idx) => {
    const block = document.createElement('div');
    block.className = 'test-block';
    
    // 准备该样例的四个模型音频
    let modelOrder = config.folders.map(folder => ({
        folderName: folder,
        url: `${folder}/${item.file}`
    }));

    // 【关键】对该样例的模型顺序进行随机打乱
    modelOrder = shuffleArray(modelOrder);

    let html = `<h2>测试组 ${idx + 1}</h2>
                <div class="caption-box"><strong>文本内容：</strong>${item.text}</div>`;

    modelOrder.forEach((m, mIdx) => {
        // name 属性编码规则: 指标_样例序号_真实模型名
        // 这样提交时我们能知道用户评的是哪个模型
        html += `
            <div class="model-row">
                <span class="sample-label">音频样本 ${mIdx + 1}</span>
                <div class="audio-box"><audio controls src="${m.url}"></audio></div>
                <div class="score-box">
                    <div class="input-group">
                        <label>MOS-Q (质量)</label>
                        <select name="Q|${idx}|${m.folderName}" required>${createOptions()}</select>
                    </div>
                    <div class="input-group">
                        <label>MOS-F (一致性)</label>
                        <select name="F|${idx}|${m.folderName}" required>${createOptions()}</select>
                    </div>
                </div>
            </div>
        `;
    });
    block.innerHTML = html;
    container.appendChild(block);
});

/**
 * 表单提交与 CSV 导出
 */
document.getElementById('survey-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    
    // CSV 表头 (UTF-8 BOM 防止 Excel 乱码)
    let csvContent = "\ufeff测试组,文本内容,模型文件夹,MOS-Q(质量),MOS-F(忠实度)\n";

    // 遍历原始配置，确保输出结果有序
    config.fileNames.forEach((item, idx) => {
        config.folders.forEach(folder => {
            const qScore = formData.get(`Q|${idx}|${folder}`);
            const fScore = formData.get(`F|${idx}|${folder}`);
            
            // 转义文本中的逗号防止破坏 CSV 格式
            const safeText = item.text.replace(/,/g, "，");
            csvContent += `${idx + 1},${safeText},${folder},${qScore},${fScore}\n`;
        });
    });

    // 执行下载
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `文生音效测评结果_${new Date().getTime()}.csv`;
    link.click();

    alert("提交成功！结果文件已下载。请妥善保存该 CSV 文件。");
});