import type { Metadata } from 'next';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'نسخه فارسی - NardArena',
  robots: {
    index: false,
    follow: false,
  },
};

// ----------------------------------------------------------------------

export default function FarsiPage() {
  return (
    <Container maxWidth="md" sx={{ py: 10 }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h3" sx={{ mb: 3, fontWeight: 900 }}>
          🎲 نرد آرنا - ترجمه فارسی محتوای لندینگ
        </Typography>
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          ⚠️ این صفحه موقتی است و باید حذف شود (URL: /fa)
        </Typography>
      </Box>

      {/* Hero Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          بخش اصلی (Hero)
        </Typography>
        <Typography variant="h5" sx={{ mb: 2 }}>
          تخته نرد آنلاین بازی کنید. ارز دیجیتال کسب کنید.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          با هوش مصنوعی رقابت کنید، در سطح جهانی بازی کنید، بازی‌ها را تماشا کنید و نتایج را
          پیش‌بینی کنید. از طریق سیستم‌های پاداش متعدد TRX و BNB کسب کنید.
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }}>
          دکمه‌ها:
        </Typography>
        <Typography>• بازی رایگان شروع کنید (Start Playing Free)</Typography>
        <Typography>• نحوه کار (How It Works)</Typography>
        <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>
          ویژگی‌های سریع:
        </Typography>
        <Typography>• حالت هوش مصنوعی (AI Mode)</Typography>
        <Typography>• چند نفره (Multiplayer)</Typography>
        <Typography>• تماشا و کسب درآمد (Watch & Earn)</Typography>
        <Typography>• پیش‌بینی (Predict)</Typography>
      </Box>

      {/* Trust Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          بخش اعتماد (Trust Badges)
        </Typography>
        <Typography>🔒 امن - SSL 256 بیتی</Typography>
        <Typography>⚡ سریع - برداشت فوری</Typography>
        <Typography>🌐 جهانی - بیش از 150 کشور</Typography>
        <Typography>✅ تایید شده - پلتفرم دارای مجوز</Typography>
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          بخش ویژگی‌ها (Features)
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }}>
          عنوان: همه چیزی که برای بازی و کسب درآمد نیاز دارید
        </Typography>
        <Typography sx={{ mb: 2 }}>
          پیشرفته‌ترین پلتفرم تخته نرد را با ویژگی‌های پیشرو که برای بازیکنان و تماشاگران طراحی
          شده، تجربه کنید.
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          1. بازی با هوش مصنوعی
        </Typography>
        <Typography>
          با حریفان هوش مصنوعی هوشمند در سطوح مختلف دشواری رقابت کنید. مناسب برای کامل کردن
          استراتژی‌ها، تست تاکتیک‌های جدید و بهبود مهارت‌های شما.
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          2. رقابت جهانی
        </Typography>
        <Typography>
          با بازیکنان واقعی از سراسر جهان در مسابقات زنده رقابت کنید. در جدول امتیازات جهانی بالا
          بروید و تسلط خود را ثابت کنید.
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          3. پرداخت‌های کریپتو
        </Typography>
        <Typography>
          تراکنش‌های امن و فوری با استفاده از TRX (ترون) و BNB (بایننس اسمارت چین). بازی کنید،
          کسب کنید و به صورت یکپارچه برداشت کنید.
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          4. کسب پاداش
        </Typography>
        <Typography>
          با بازی کردن، تماشای بازی‌های زنده و پیش‌بینی نتایج مسابقات، ارز دیجیتال کسب کنید. راه‌های
          متعدد برای افزایش درآمد شما.
        </Typography>
      </Box>

      {/* Game Modes Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          بخش حالت‌های بازی (Game Modes)
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }}>
          عنوان: سبک بازی خود را انتخاب کنید
        </Typography>
        <Typography sx={{ mb: 2 }}>
          چه بخواهید تمرین کنید، رقابت کنید یا در تورنمنت‌ها شرکت کنید، ما شما را پوشش می‌دهیم.
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          1. حالت AI - تمرین و بهبود
        </Typography>
        <Typography>
          با حریفان هوش مصنوعی هوشمند در چندین سطح دشواری رقابت کنید. مناسب برای یادگیری
          استراتژی‌ها، تست تاکتیک‌های جدید و بهبود مهارت‌ها.
        </Typography>
        <Typography>• سطوح دشواری متعدد</Typography>
        <Typography>• تطبیق فوری</Typography>
        <Typography>• تمرین بدون فشار</Typography>
        <Typography>• بهبود مهارت</Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          2. حالت آنلاین - رقابت جهانی
        </Typography>
        <Typography>
          با بازیکنان واقعی از سراسر جهان بازی کنید. در جدول امتیازات جهانی بالا بروید، در
          مسابقات رتبه‌بندی شرکت کنید و پاداش کسب کنید.
        </Typography>
        <Typography>• چند نفره در زمان واقعی</Typography>
        <Typography>• جدول امتیازات جهانی</Typography>
        <Typography>• مسابقات رتبه‌بندی</Typography>
        <Typography>• پاداش‌های کریپتو</Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          3. حالت تورنمنت - به زودی
        </Typography>
        <Typography>
          در تورنمنت‌های پرریسک با جوایز عظیم شرکت کنید. به رویدادهای برنامه‌ریزی شده بپیوندید و
          برای موقعیت برتر مبارزه کنید.
        </Typography>
        <Typography>• جایزه‌های بزرگ</Typography>
        <Typography>• رویدادهای برنامه‌ریزی شده</Typography>
        <Typography>• بریکت‌های حذفی</Typography>
        <Typography>• عناوین قهرمانی</Typography>
      </Box>

      {/* Earnings Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          بخش سیستم درآمد (Earnings System)
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }}>
          عنوان: راه‌های متعدد برای کسب کریپتو
        </Typography>
        <Typography sx={{ mb: 2 }}>
          چه بازیکن، تماشاگر یا تحلیلگر باشید، فرصت درآمدزایی برای شما وجود دارد.
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          1. بازی کنید و درآمد کسب کنید
        </Typography>
        <Typography>
          در مسابقات برنده شوید و پاداش‌های کریپتو دریافت کنید. هرچه بیشتر بازی کنید و برنده
          شوید، بیشتر درآمد کسب می‌کنید.
        </Typography>
        <Typography>مثال: 10 بازی برنده شوید = حدود 50 دلار TRX</Typography>
        <Typography>• پاداش‌های فوری</Typography>
        <Typography>• بدون نیاز به واریز</Typography>
        <Typography>• درآمد مبتنی بر مهارت</Typography>
        <Typography>• نرخ‌های رقابتی</Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          2. تماشا کنید و درآمد کسب کنید
        </Typography>
        <Typography>
          فقط با تماشای مسابقات زنده، ارز دیجیتال کسب کنید. با جامعه تعامل داشته باشید و پاداش
          دریافت کنید.
        </Typography>
        <Typography>مثال: 20 بازی تماشا کنید = حدود 10 دلار BNB</Typography>
        <Typography>• درآمد غیرفعال</Typography>
        <Typography>• نیازی به بازی کردن نیست</Typography>
        <Typography>• مشارکت در جامعه</Typography>
        <Typography>• پرداخت‌های منظم</Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          3. پیش‌بینی کنید و درآمد کسب کنید
        </Typography>
        <Typography>
          نتایج مسابقات را پیش‌بینی کنید و در استخر کمیسیون سهیم شوید. توانایی‌های تحلیلی خود را
          آزمایش کنید.
        </Typography>
        <Typography>مثال: پیش‌بینی‌های صحیح = تا 30% کمیسیون</Typography>
        <Typography>• اشتراک در استخر کمیسیون</Typography>
        <Typography>• پیش‌بینی‌های متعدد</Typography>
        <Typography>• تفکر استراتژیک</Typography>
        <Typography>• پاداش‌های بالا</Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          ارزهای دیجیتال پشتیبانی شده:
        </Typography>
        <Typography>💎 TRX - ترون</Typography>
        <Typography>⚡ BNB - بایننس اسمارت چین</Typography>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          بخش نحوه کار (How It Works)
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }}>
          عنوان: در 3 مرحله ساده شروع کنید
        </Typography>
        <Typography sx={{ mb: 2 }}>
          به هزاران بازیکن در سراسر جهان بپیوندید و امروز شروع به کسب کریپتو کنید.
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          مرحله 1: ثبت نام
        </Typography>
        <Typography>حساب رایگان خود را در 30 ثانیه ایجاد کنید. نیازی به کارت اعتباری نیست.</Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          مرحله 2: بازی یا تماشا کنید
        </Typography>
        <Typography>
          مسیر خود را انتخاب کنید: در مسابقات رقابت کنید، بازی‌های زنده تماشا کنید یا نتایج را
          پیش‌بینی کنید.
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          مرحله 3: کریپتو کسب کنید
        </Typography>
        <Typography>
          در TRX یا BNB پاداش دریافت کنید. هر زمان که بخواهید مستقیماً به کیف پول خود برداشت کنید.
        </Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>
          دکمه: همین حالا شروع کنید (Get Started Now)
        </Typography>
        <Typography variant="caption">
          نیازی به کارت اعتباری نیست • برای همیشه رایگان
        </Typography>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          سوالات متداول (FAQ)
        </Typography>
        <Typography sx={{ mb: 2 }}>
          سوال دارید؟ ما پاسخ داریم. چیزی که به دنبالش هستید را پیدا نمی‌کنید؟ با تیم پشتیبانی ما
          تماس بگیرید.
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          1. چگونه شروع به کسب کریپتو کنم؟
        </Typography>
        <Typography>
          به سادگی برای یک حساب رایگان ثبت نام کنید، ایمیل خود را تایید کنید و می‌توانید فوراً شروع
          به کسب درآمد کنید. می‌توانید با بازی، تماشای مسابقات یا پیش‌بینی نتایج درآمد کسب کنید.
          نیازی به واریز نیست!
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          2. کدام ارزهای دیجیتال را پشتیبانی می‌کنید؟
        </Typography>
        <Typography>
          در حال حاضر ما از TRX (ترون) و BNB (بایننس اسمارت چین) برای همه تراکنش‌ها پشتیبانی
          می‌کنیم. هر دو تراکنش‌های سریع و کم‌هزینه و برداشت‌های فوری به کیف پول شما ارائه
          می‌دهند.
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          3. حداقل مبلغ برداشت چقدر است؟
        </Typography>
        <Typography>
          بله، حداقل برداشت معادل 5 دلار کریپتو است. این تضمین می‌کند که کارمزد تراکنش درآمد شما
          را کاهش نمی‌دهد. می‌توانید هر زمان که به این حد برسید برداشت کنید.
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          4. سیستم تماشا و کسب درآمد چگونه کار می‌کند؟
        </Typography>
        <Typography>
          وقتی مسابقات زنده را تماشا می‌کنید، بر اساس زمان تماشا و مشارکت امتیاز کسب می‌کنید. این
          امتیازها به طور خودکار روزانه به پاداش‌های کریپتو تبدیل می‌شوند. هرچه بیشتر تماشا کنید،
          بیشتر کسب می‌کنید!
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          5. آیا می‌توانم رایگان بازی کنم؟
        </Typography>
        <Typography>
          کاملاً! می‌توانید رایگان با حریفان هوش مصنوعی بازی کنید تا تمرین کنید و مهارت‌های خود را
          بهبود ببخشید. وقتی آماده شدید، می‌توانید به مسابقات آنلاین یا تورنمنت‌ها بپیوندید تا برای
          پاداش‌های واقعی کریپتو رقابت کنید.
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          6. دقت حریف هوش مصنوعی چقدر است؟
        </Typography>
        <Typography>
          هوش مصنوعی ما از الگوریتم‌های پیشرفته برای ارائه گیم‌پلی چالش برانگیز در چندین سطح دشواری
          استفاده می‌کند. از مبتدی تا حرفه‌ای، هوش مصنوعی ما با سطح مهارت شما سازگار می‌شود تا
          بهترین تجربه آموزشی را داشته باشید.
        </Typography>
      </Box>

      {/* CTA Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          بخش فراخوان نهایی (CTA)
        </Typography>
        <Typography variant="h5" sx={{ mb: 2 }}>
          آماده شروع کسب درآمد هستید؟
        </Typography>
        <Typography sx={{ mb: 2 }}>
          به هزاران بازیکن در سراسر جهان بپیوندید که در حال حاضر هنگام بازی کردن بازی مورد علاقه
          خود در حال کسب کریپتو هستند. بدون واریز، بدون هزینه پنهان، فقط بازی خالص و کسب درآمد.
        </Typography>
        <Typography variant="h6">دکمه‌ها:</Typography>
        <Typography>🚀 همین الان شروع به کسب درآمد کنید (Start Earning Now)</Typography>
        <Typography>• ورود (Sign In)</Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>
          آمار:
        </Typography>
        <Typography>• 10,000+ بازیکن فعال</Typography>
        <Typography>• 50,000+ بازی انجام شده</Typography>
        <Typography>• $100K+ کریپتو کسب شده</Typography>
      </Box>

      {/* Footer */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          فوتر
        </Typography>
        <Typography variant="h6">🎲 نرد آرنا</Typography>
        <Typography sx={{ mb: 2 }}>
          اولین پلتفرم تخته نرد جهان که در آن می‌توانید بازی کنید، تماشا کنید، پیش‌بینی کنید و
          پاداش‌های کریپتو کسب کنید.
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          محصول:
        </Typography>
        <Typography>• نحوه بازی</Typography>
        <Typography>• حالت‌های بازی</Typography>
        <Typography>• سیستم درآمد</Typography>
        <Typography>• تورنمنت‌ها</Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          شرکت:
        </Typography>
        <Typography>• درباره ما</Typography>
        <Typography>• تماس</Typography>
        <Typography>• بلاگ</Typography>
        <Typography>• فرصت‌های شغلی</Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          قانونی:
        </Typography>
        <Typography>• شرایط خدمات</Typography>
        <Typography>• سیاست حفظ حریم خصوصی</Typography>
        <Typography>• سیاست کوکی</Typography>
        <Typography>• بازی منصفانه</Typography>

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
          شبکه‌های اجتماعی:
        </Typography>
        <Typography>• توییتر</Typography>
        <Typography>• دیسکورد</Typography>
        <Typography>• تلگرام</Typography>
        <Typography>• اینستاگرام</Typography>

        <Typography variant="body2" sx={{ mt: 2 }}>
          © 2025 نرد آرنا. تمامی حقوق محفوظ است.
        </Typography>
      </Box>

      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: 'error.lighter',
          border: '2px solid',
          borderColor: 'error.main',
        }}
      >
        <Typography variant="h6" color="error" sx={{ mb: 1 }}>
          ⚠️ یادآوری مهم
        </Typography>
        <Typography color="error.dark">
          این صفحه باید به زودی حذف شود. فقط برای مرور محتوا و ترجمه ایجاد شده است.
        </Typography>
        <Typography color="error.dark" sx={{ mt: 1 }}>
          URL: /fa
        </Typography>
      </Box>
    </Container>
  );
}
