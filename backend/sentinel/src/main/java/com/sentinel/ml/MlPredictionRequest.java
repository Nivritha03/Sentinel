
package com.sentinel.ml;

public class MlPredictionRequest {

    private double amount;
    private String currency;
    private boolean sameSenderReceiver;
    private int hourOfDay;
    private int dayOfWeek;

    public MlPredictionRequest() {}

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public boolean isSameSenderReceiver() { return sameSenderReceiver; }
    public void setSameSenderReceiver(boolean sameSenderReceiver) { this.sameSenderReceiver = sameSenderReceiver; }

    public int getHourOfDay() { return hourOfDay; }
    public void setHourOfDay(int hourOfDay) { this.hourOfDay = hourOfDay; }

    public int getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(int dayOfWeek) { this.dayOfWeek = dayOfWeek; }
}
