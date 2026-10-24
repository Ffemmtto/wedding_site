from django.db import models
from django.utils.timezone import now

class Guest(models.Model):
    STATUS_CHOICES = [
        ('alone', 'Да, приду один'),
        ('spouse', 'Приду с супругой/ом'),
        ('no', 'Нет, не смогу прийти'),
    ]
    first_name = models.CharField('Имя', max_length=100)
    last_name = models.CharField('Фамилия', max_length=100)
    status = models.CharField('Статус', max_length=20, choices=STATUS_CHOICES)
    created_at = models.DateTimeField('Дата ответа', default=now)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Wish(models.Model):
    name = models.CharField('Имя', max_length=150)
    text = models.TextField('Пожелание')
    created_at = models.DateTimeField('Дата', default=now)

    def __str__(self):
        return self.name