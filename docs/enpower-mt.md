# ENPower Compass · MT Programı Prototipi

18 aylık ENPower Management Trainee programı için rol bazlı gelişim yolculuğu prototipi.
**Tüm kişi, birim, rakam ve şirket verileri kurgusaldır.** Ücretli servis veya backend yoktur; durum tarayıcıda (localStorage) tutulur.

## Ürün kararları

| Karar | Gerekçe |
| --- | --- |
| Tek uygulama, 3 rol görünümü (MT · Talent Coach · İK) | Aynı veri, farklı soru: "Ben neredeyim?" / "Kime dokunmalıyım?" / "Program ve yatırım nerede?" |
| Program yapısı: Bootcamp (1) → 3 × 4 ay rotasyon (Operasyon → Ticari & Finans → Dönüşüm) → Launchpad (14–18) | Her MT değer zincirinin üç ucunu görür; yerleşim kararı 13. ayda kanıtla verilir. |
| Hazırlık endeksi = %50 yetkinlik + %30 host geri bildirimi + %20 teslim ritmi | Tek sayı, ama bileşenleri açık; MT de kendi endeksini görür (şeffaflık). |
| Risk sinyalleri (nabız, koçluk sessizliği, teslim, hazırlık, tercih uyumu) yalnızca koç/İK görür | MT'yi etiketlemeden erken müdahale. Kurallar `lib/journey.ts` içinde, test edilmiş. |
| MT, taslak yerleşimleri görmez | Karar kalibrasyondan önce sızarsa beklenti ve tutundurma riski yaratır. |
| Koç ajandası kural tabanlı, yapay zekâ değil | Açıklanabilir, ücretsiz, koçun yargısını destekler; yerine geçmez. |
| İK kokpiti "önce ana mesaj" | Yönetim özeti → KPI → gerekçe → öneri; risk altındaki yatırım TL olarak (kurgusal). |
| Mobil: alt sekme çubuğu, yatay MT seçici, harita yerine varsayılan liste | Haritayı telefonda okunur kılmak zor; liste aynı bilgiyi verir, harita seçili yola zoom'lar. |

## @xyflow/react değerlendirmesi

**Rotasyon haritası için: evet.** Problem doğası gereği bir graf: faz kolonlarında birimler (düğüm), aralarında MT akışları (kenar, kalınlık = MT sayısı). xyflow özel düğüm/kenar, pan/zoom, erişilebilir kontroller ve tema desteğini MIT lisansıyla verir. İK planlayıcısında düğüme dokunarak taslak yerleşim yapılır; kapasite/tercih/hazırlık kontrolleri anında düğüm halkasına yansır.

**18 aylık yolculuk için: hayır.** Yolculuk doğrusal bir zaman çizelgesi; graf motoru burada pan/zoom ile sayfa kaydırmayı çakıştırır, mobilde okunabilirliği düşürür ve ekran okuyucu deneyimini zayıflatır. Bunun yerine semantik `<ol>` tabanlı dikey zaman çizelgesi + 18 hücreli faz şeridi kullanıldı.

Maliyet kontrolü: xyflow yalnızca harita rotasında, `React.lazy` ile yüklenir (~55 kB gzip). Pro özellikleri kullanılmadı; atıf rozeti açık bırakıldı.

## Mimari

```
src/features/enpower/
  data/        program.ts (fazlar, birimler, yetkinlik modeli, kilometre taşları) · people.ts (kurgusal kişiler)
  lib/         journey.ts (zaman, hazırlık, risk, yerleşim doğrulama) · derive.ts (seed + kullanıcı etkileşimi) · cohort.ts
  store/       program-store.ts (Zustand + persist: rol, nabız, çıktılar, yansımalar, seanslar, yerleşimler)
  components/  atoms, page-shell (header + mobil sekme çubuğu), role-switcher, journey-timeline, phase-strip,
               competency-radar (Recharts), rotation-map/ (xyflow: build-graph saf fonksiyon + özel düğüm/kenar)
  views/       mt-home · coach-home · hr-home
  pages/       home · journey · rotation-map · coaching · cohort
```

- Tüm iş kuralları saf fonksiyonlar → birim testli (`*.test.ts`).
- `DEMO_TODAY = 2026-10-08` (12. ay, R3) sabit; demo deterministik.
- Template'teki demo modülleri (tasks, apps, chats, users, dashboard, Clerk) kaldırıldı; auth/hata/ayar sayfaları korundu.

## Demo akışı (5 dk)

1. **MT (Ece)**: nabız gir, bir çıktıyı işaretle, yansıma yaz → hazırlık ve sinyaller güncellenir.
2. **Koç (Aylin)**: öncelik kuyruğunda Zeynep "yüksek dikkat" → *Seansa hazırlan* → ajanda → seansı kaydet → "koçluk teması koptu" sinyali kalkar.
3. **İK (Derya)**: yönetim özeti → *Planla* → Zeynep'i seç → haritada/panelde yerleşim ata, kapasite ve uyarıları gör → Kohort analitiğinde ısı haritası.

Sağ alt menüdeki **Demo verisini sıfırla** başlangıç durumuna döndürür.

## Sonraki adımlar (öneri)

- Gerçek veri öncesi: KVKK açısından nabız/yansıma verisinin görünürlük matrisi ve saklama süresi.
- Hazırlık endeksi ağırlıklarının geçmiş kohortlarla kalibrasyonu (şu an varsayım).
- SSO + HRIS entegrasyonu; host yönetici rolü (geri bildirim girişi).
