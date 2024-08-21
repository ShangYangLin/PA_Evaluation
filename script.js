$(document).ready(function() {
    $('#sendBtn').on('click', function() {
        // Hide form and show loading spinner
        $('#form-container').addClass('hidden-intro');
        $('#intro').addClass('hidden-intro');
        $('#loading').show(); // 显示加载动画
  
        // Get form values
        const formData = {
            name: $('#name').val(),
            height: parseFloat($('#height').val()),
            weight: parseFloat($('#weight').val()),
            age: parseInt($('#age').val()),
            gender: $('#gender').val(),
            systolic: parseFloat($('#systolic').val()),
            diastolic: parseFloat($('#diastolic').val()),
            potassium: parseFloat($('#potassium').val()),
            egfr: parseFloat($('#egfr').val()),
            PRA: parseFloat($('#PRA').val()),
            calcium: parseFloat($('#calcium').val()),
            phosphorus: parseFloat($('#phosphorus').val()),
            phone: $('#phone').val(),
            hospital: $('#hospital').val()
        };
  
        // Debugging: Log form data
        console.log('Form Data:', formData);
        
        // Send data to Google Apps Script
        $.post('https://script.google.com/macros/s/AKfycbwX1jLKHxHV6sAkj7KllZQ1h_PGyt3_qKMVeobdrIci5Kk_TOF9aMlLKPtBYCISi9kzcw/exec', JSON.stringify(formData), function(response) {
            console.log('Response from server:', response);
            // Proceed with existing code
            setTimeout(() => {
                let resultCategory, recommendation;
                if (formData.potassium <= 3.65 && formData.PRA <= 0.985) {
                    resultCategory = 'A';
                    recommendation = '建議您接受A類治療或檢測';
                } else if (formData.potassium <= 3.65 && formData.PRA > 0.985) {
                    resultCategory = 'B';
                    recommendation = '建議您接受B類治療或檢測';
                } else if (formData.potassium > 3.65 && formData.PRA <= 0.985) {
                    resultCategory = 'C';
                    recommendation = '建議您接受C類治療或檢測';
                } else {
                    resultCategory = 'D';
                    recommendation = '建議您接受D類治療或檢測';
                }
  
                const heightInMeters = formData.height / 100;
                const bmi = (formData.weight / (heightInMeters * heightInMeters)).toFixed(2);
  
                $('#loading').hide();
                $('#form-container').addClass('hidden');
                $('#result-container').removeClass('hidden');
                $('#result-text').html(`您好，${formData.name}。您的BMI為${bmi}。您屬於${resultCategory}類。${recommendation}`);
  
                generatePieChart(resultCategory); // Pass the result category to the pie chart function
            }, Math.random() * (7000 - 2000) + 1000); 
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Error:', textStatus, errorThrown);
            $('#loading').hide();
            alert(`提交数据时出现错误：${textStatus}`);
        });
    });
  });
  
  function generatePieChart(category) {
      const ctx = document.getElementById('pie-chart').getContext('2d');
  
      // Initialize data values
    let dataValues = [0, 0, 0, 0];
    const labels = ['原發性高血壓', '醛固酮高血壓', '庫欣氏症', '其他'];

    const maxCushing = 13;
    const maxOther = 12;

    if (category === 'A' || category === 'B' || category === 'C') {
        // 随机生成 50 到 100 之间的值为 '醛固酮高血壓'
        dataValues[1] = (Math.random() * 50 + 50).toFixed(1);

        // 随机生成 '庫欣氏症' 和 '其他'，不超过各自的最大值
        dataValues[2] = (Math.random() * maxCushing).toFixed(1);
        dataValues[3] = (Math.random() * maxOther).toFixed(1);

        // 计算已知值的总和
        const totalKnown = dataValues.reduce((a, b) => a + parseFloat(b), 0);
        const remaining = 100 - totalKnown;

        // 确保 '原發性高血壓' 不为0
        dataValues[0] = (remaining > 0 ? remaining : 1).toFixed(1);

    } else if (category === 'D') {
        // 随机生成 50 到 100 之间的值为 '原發性高血壓'
        dataValues[0] = (Math.random() * 50 + 50).toFixed(1);

        // 随机生成 '庫欣氏症' 和 '其他'，不超过各自的最大值
        dataValues[2] = (Math.random() * maxCushing).toFixed(1);
        dataValues[3] = (Math.random() * maxOther).toFixed(1);

        // 计算已知值的总和
        const totalKnown = dataValues.reduce((a, b) => a + parseFloat(b), 0);
        const remaining = 100 - totalKnown;

        // 确保 '醛固酮高血壓' 不为0
        dataValues[1] = (remaining > 0 ? remaining : 1).toFixed(1);
    }

    // 确保总和正好为100
    const finalTotal = dataValues.reduce((a, b) => a + parseFloat(b), 0);
    const adjust = 100 - finalTotal;
    if (adjust !== 0) {
        dataValues[0] = (parseFloat(dataValues[0]) + adjust).toFixed(1);
    }

    // 打印最终值
    console.log('Data Values:', dataValues);


      const dataPercentages = dataValues.map(value => parseFloat(value).toFixed(1)); // One decimal place
  
      const data = {
          labels: labels, // 标签
          datasets: [{
              data: dataPercentages, // 数据
              backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56']
          }]
      };
  
      new Chart(ctx, {
          type: 'pie',
          data: data,
          options: {
              responsive: true,
              plugins: {
                  tooltip: {
                      callbacks: {
                          label: function(tooltipItem) {
                              // 显示标签和数据值
                              const label = data.labels[tooltipItem.dataIndex];
                              const value = data.datasets[0].data[tooltipItem.dataIndex];
                              return `${label}: ${value}%`;
                          }
                      }
                  },
                  legend: {
                      display: true,
                      position: 'top'
                  },
                  datalabels: {
                      display: true,
                      color: '#000',
                      formatter: function(value, context) {
                          const label = data.labels[context.dataIndex];
                          return `${label}: ${value}%`;
                      }
                  }
              }
          },
          plugins: [ChartDataLabels] // 确保 DataLabels 插件已加载
      });
  }
  