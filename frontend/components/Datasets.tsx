import React from 'react';
import { Database, FileText, ExternalLink } from 'lucide-react';
import { Language } from '../types';

export const Datasets: React.FC<{ lang: Language }> = ({ lang }) => {
  const ds = [
    {
      name: 'Kaggle PlantVillage Dataset',
      count: '54,306 images',
      types: '38 classes',
      desc: 'Standard plant disease dataset covering multiple crops.',
      link: 'https://www.kaggle.com/datasets/emmarex/plantdisease',
    },
    {
      name: 'Rice Leaf Disease Dataset',
      count: '120 images',
      types: '3 classes',
      desc: 'Specific Bangladeshi rice diseases: Brown spot, Bacterial blight.',
      link: 'https://www.kaggle.com/datasets/vbookshelf/rice-leaf-diseases',
    },
    {
      name: 'Jute Pest & Disease Data',
      count: '2,500 images',
      types: '10 classes',
      desc: 'Custom curated data for Jute crops in Bangladesh.',
      link: 'https://github.com/your-org/jute-pest-dataset', // replace if needed
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 space-y-12">
      <div className="max-w-2xl">
        <h2 className="text-4xl font-black mb-4">
          {lang === 'bn' ? 'আমাদের ডেটাসেট' : 'AI Datasets'}
        </h2>
        <p className="text-zinc-500">
          {lang === 'bn'
            ? 'আমরা আমাদের এআই মডেল প্রশিক্ষণের জন্য বিশ্বমানের ওপেন সোর্স ডেটাসেট ব্যবহার করি।'
            : 'We use world-class open-source datasets to train our AI models for maximum accuracy.'}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {ds.map((d, i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-700 flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/30 w-fit rounded-2xl group-hover:rotate-6 transition-all">
                <Database className="text-green-600" />
              </div>
              <h3 className="text-xl font-black">{d.name}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {d.desc}
              </p>
              <div className="flex gap-4 pt-4">
                <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-700 rounded-lg text-xs font-bold">
                  {d.count}
                </div>
                <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-700 rounded-lg text-xs font-bold">
                  {d.types}
                </div>
              </div>
            </div>

            {/* ✅ WORKING VIEW DATASET LINK */}
            <a
              href={d.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex items-center justify-center gap-2 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              {lang === 'bn' ? 'ডেটাসেট দেখুন' : 'View Dataset'}
            </a>
          </div>
        ))}
      </div>

      <div className="bg-green-50 dark:bg-green-900/10 p-8 rounded-3xl border border-green-100 dark:border-green-900/50 flex flex-col md:flex-row items-center gap-8">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-lg">
          <FileText className="w-10 h-10 text-green-600" />
        </div>
        <div>
          <h4 className="text-xl font-bold mb-1">
            {lang === 'bn' ? 'আপনার ডেটাসেট যুক্ত করুন' : 'Contribute Your Dataset'}
          </h4>
          <p className="text-zinc-500 text-sm max-w-xl">
            {lang === 'bn'
              ? 'আপনি যদি একজন গবেষক হয়ে থাকেন, আপনার সংগৃহীত ডাটা আমাদের দিয়ে সাহায্য করতে পারেন।'
              : 'If you are a researcher, you can help by contributing your collected crop disease data to our open platform.'}
          </p>
        </div>
        <button className="md:ml-auto px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all whitespace-nowrap">
          {lang === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
        </button>
      </div>
    </div>
  );
};
