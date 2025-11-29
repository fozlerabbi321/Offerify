import { DataSource } from 'typeorm';
import { Category } from '../../domain/entities/category.entity';

export async function seedCategories(dataSource: DataSource) {
    const categoryRepository = dataSource.getRepository(Category);

    const categories = [
        { name: 'Food & Drinks', slug: 'food-and-drinks', iconPath: '/public/categories/food.png' },
        { name: 'Fashion', slug: 'fashion', iconPath: '/public/categories/fashion.png' },
        { name: 'Electronics', slug: 'electronics', iconPath: '/public/categories/electronics.png' },
    ];

    for (const cat of categories) {
        const exists = await categoryRepository.findOneBy({ slug: cat.slug });
        if (!exists) {
            await categoryRepository.save(categoryRepository.create(cat));
        }
    }
}
